import { client as defaultClient } from "../../openai.service";
import OpenAI from "openai";
import type {
  ChatCompletionChunk,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from "openai/resources/chat/completions";

export type Tool<P, R> = ChatCompletionTool & {
  handler: (params: P) => Promise<R>;
};

export type AgentOptionCallbacks = {
  onFunctionCall?: (
    called: ChatCompletionMessageToolCall,
    params: unknown
  ) => void;
  onFunctionResult?: (result: unknown) => void;
  onMessage?: (chat: ChatCompletionMessage) => void;
};

export type AgentOptions = {
  client?: OpenAI;
  prompt: string;
  messages?: Array<ChatCompletionMessageParam>;
  tools: Array<Tool<any, any>>;
} & AgentOptionCallbacks;

export default class Agent {
  private messages: Array<ChatCompletionMessageParam>;

  private client: OpenAI;

  private tools: Array<Tool<any, any>>;

  private callbacks: AgentOptionCallbacks;

  constructor({
    client = defaultClient,
    prompt,
    messages = [],
    tools,
    ...rest
  }: AgentOptions) {
    this.messages = [
      {
        role: "system",
        content: prompt,
      },
      ...messages,
    ];
    this.client = client;
    this.tools = tools;
    this.callbacks = rest;
  }

  async *chat(
    ...messages: ChatCompletionMessageParam[]
  ): AsyncGenerator<string> {
    while (true) {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o",
        tools: this.tools,
        messages: [...this.messages, ...messages],
        stream: true,
      });

      let message = {} as ChatCompletionMessage;
      for await (const chunk of completion) {
        message = this.messageReducer(message, chunk);
        yield message.content ?? "";
      }
      this.messages.push(message);
      this.callbacks.onMessage?.(message);

      if (!message.tool_calls) {
        return;
      }

      for (const toolCall of message.tool_calls) {
        const result = await this.callTool(toolCall);
        const newMessage = {
          tool_call_id: toolCall.id,
          role: "tool" as const,
          name: toolCall.function.name,
          content: JSON.stringify(result),
        };
        this.messages.push(newMessage);
      }
    }
  }

  private messageReducer(
    previous: ChatCompletionMessage,
    item: ChatCompletionChunk
  ): ChatCompletionMessage {
    const reduce = (acc: any, delta: ChatCompletionChunk.Choice.Delta) => {
      acc = { ...acc };
      for (const [key, value] of Object.entries(delta)) {
        if (acc[key] === undefined || acc[key] === null) {
          acc[key] = value;
          //  OpenAI.Chat.Completions.ChatCompletionMessageToolCall does not have a key, .index
          if (Array.isArray(acc[key])) {
            for (const arr of acc[key]) {
              delete arr.index;
            }
          }
        } else if (typeof acc[key] === "string" && typeof value === "string") {
          acc[key] += value;
        } else if (typeof acc[key] === "number" && typeof value === "number") {
          acc[key] = value;
        } else if (Array.isArray(acc[key]) && Array.isArray(value)) {
          const accArray = acc[key];
          for (let i = 0; i < value.length; i++) {
            const { index, ...chunkTool } = value[i];
            if (index - accArray.length > 1) {
              throw new Error(
                `Error: An array has an empty value when tool_calls are constructed. tool_calls: ${accArray}; tool: ${value}`
              );
            }
            accArray[index] = reduce(accArray[index], chunkTool);
          }
        } else if (typeof acc[key] === "object" && typeof value === "object") {
          acc[key] = reduce(acc[key], value);
        }
      }
      return acc;
    };

    const choice = item.choices[0];
    if (!choice) {
      // chunk contains information about usage and token counts
      return previous;
    }
    return reduce(previous, choice.delta) as ChatCompletionMessage;
  }

  private async callTool(
    tool_call: ChatCompletionMessageToolCall
  ): Promise<unknown> {
    this.callbacks.onFunctionCall?.(tool_call, tool_call.function.arguments);
    if (tool_call.type !== "function")
      throw new Error(`Unexpected tool_call type: ${tool_call.type}`);
    const args = JSON.parse(tool_call.function.arguments);

    const tool = this.tools.find(
      (t) => t.function.name === tool_call.function.name
    );
    if (!tool) throw new Error("No tool found");
    const result = await tool.handler(args);
    this.callbacks.onFunctionResult?.(result);
    return result;
  }

  public addListener(listener: AgentOptionCallbacks) {
    this.callbacks = { ...this.callbacks, ...listener };
  }
}
