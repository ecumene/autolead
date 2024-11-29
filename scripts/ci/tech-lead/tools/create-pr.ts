import { octokit, owner, repo } from "../../../octokit.service";
import type { Tool } from "../Agent";

const createPR: Tool<
  { issueNumber: number; title: string; body: string; head: string },
  { number: number; url: string } | { error: unknown }
> = {
  type: "function",
  function: {
    name: "create_pr",
    description: "Creates a pull request linked to a GitHub issue",
    parameters: {
      type: "object",
      properties: {
        issueNumber: {
          type: "number",
          description: "The issue number to link the PR to",
        },
        title: {
          type: "string",
          description: "Title of the pull request",
        },
        body: {
          type: "string",
          description: "Description/body of the pull request",
        },
        head: {
          type: "string",
          description: "The name of the branch containing the changes",
        },
      },
      required: ["issueNumber", "title", "body", "head"],
    },
  },
  handler: async ({ issueNumber, title, body, head }) => {
    const pr = await octokit.pulls.create({
      owner,
      repo,
      title,
      body: `Closes #${issueNumber}\n\n${body}`,
      head,
      base: "main",
    });

    return {
      number: pr.data.number,
      url: pr.data.html_url,
    };
  },
};

export default createPR;
