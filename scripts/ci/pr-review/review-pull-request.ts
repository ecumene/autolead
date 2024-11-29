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

async function reviewPullRequest(diffContent: string, issueContext: string) {
  const completion = await client.beta.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a senior code reviewer. Compare the provided pull request diff to the issue and \
determine if it should be approved or not. The issue context is the acceptance criteria of the \
Pull-Request. If the diff doesn't address the content of the issue, request changes. If it does, \
approve. If you don't know, approve.",
      },
      {
        role: "user",
        content: `diffContent: ${diffContent}\nissueContext: ${issueContext}`,
      },
    ],
    response_format: zodResponseFormat(prReviewResponse, "review"),
  });

  return completion.choices[0].message.parsed;
}

export { reviewPullRequest };
