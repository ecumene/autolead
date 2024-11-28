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

  private prompt: string;

  private client: OpenAI;

  private tools: Array<Tool<any, any>>;

  private onFunctionCall?: (
    called: ChatCompletionMessageToolCall,
    params: unknown
  ) => void;

  private callbacks: AgentOptionCallbacks;

  constructor({
    client = defaultClient,
    prompt,
    messages = [],
    tools,
    ...rest
  }: AgentOptions) {
    this.prompt = prompt;
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
      console.log("Creating chat completion", [
        {
          role: "system",
          content: this.prompt,
        },
        ...this.messages,
        ...messages,
      ]);
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o",
        tools: this.tools,
        messages: [
          {
            role: "system",
            content: this.prompt,
          },
          ...this.messages,
          ...messages,
        ],
        stream: true,
      });

      let message = {} as ChatCompletionMessage;
      // eslint-disable-next-line no-await-in-loop
      for await (const chunk of completion) {
        message = this.messageReducer(message, chunk);
        yield message.content ?? "";
      }
      messages.push({
        role: "assistant",
        content: message.content,
      });
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
        messages.push(newMessage);
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
          for (let i = 0; i < value.length; i += 1) {
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
    return reduce(previous, item.choices[0]!.delta) as ChatCompletionMessage;
  }

  private callTool(tool_call: ChatCompletionMessageToolCall): Promise<unknown> {
    this.callbacks.onFunctionCall?.(tool_call, tool_call.function.arguments);
    if (tool_call.type !== "function")
      throw new Error(`Unexpected tool_call type: ${tool_call.type}`);
    const args = JSON.parse(tool_call.function.arguments);

    const tool = this.tools.find(
      (t) => t.function.name === tool_call.function.name
    );
    if (!tool) throw new Error("No tool found");
    return tool.handler(args);
  }
}
