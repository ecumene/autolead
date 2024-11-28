import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { client } from "../../openai.service";

const prReviewResponse = z.object({
  approved: z.boolean(),
  reason: z.string(),
  suggestedChanges: z
    .array(
      z.object({
        file: z.string(),
        line: z.number().optional(),
        suggestion: z.string(),
      })
    )
    .optional(),
});

async function reviewPullRequest(diffContent: string) {
  const completion = await client.beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a senior code reviewer. Review the provided pull request diff and determine if it should be approved or not. Consider code quality, potential bugs, and best practices.",
      },
      { role: "user", content: diffContent },
    ],
    response_format: zodResponseFormat(prReviewResponse, "review"),
  });

  return completion.choices[0].message.parsed;
}

export { reviewPullRequest };
