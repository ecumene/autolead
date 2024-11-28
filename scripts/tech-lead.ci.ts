import { OpenAI } from "openai";

const client = new OpenAI();

export async function summarizeIssuesAndPRs(issues: any[], prs: any[]) {
  const prompt = `
    You are a tech lead at a company. You are given a list of issues and pull requests.
    Please summarize the issues and pull requests in a way that is easy for the tech lead to understand.
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content: issues
          .map((issue) => `#${issue.number} - ${issue.title}`)
          .join("\n"),
      },
      {
        role: "user",
        content: prs.map((pr) => `#${pr.number} - ${pr.title}`).join("\n"),
      },
    ],
  });

  return response.choices[0].message.content;
}
