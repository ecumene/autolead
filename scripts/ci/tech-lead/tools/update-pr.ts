import { octokit, owner, repo } from "../../../octokit.service";
import type { Tool } from "../Agent";

const updatePR: Tool<
  { prNumber: number; title?: string; body?: string },
  { number: number; url: string } | { error: unknown }
> = {
  type: "function",
  function: {
    name: "update_pr",
    description: "Updates an existing pull request's title and/or body",
    parameters: {
      type: "object",
      properties: {
        prNumber: {
          type: "number",
          description: "The PR number to update",
        },
        title: {
          type: "string",
          description: "New title for the pull request",
        },
        body: {
          type: "string",
          description: "New description/body for the pull request",
        },
      },
      required: ["prNumber"],
    },
  },
  handler: async ({ prNumber, title, body }) => {
    try {
      const pr = await octokit.pulls.update({
        owner,
        repo,
        pull_number: prNumber,
        ...(title && { title }),
        ...(body && { body }),
      });

      return {
        number: pr.data.number,
        url: pr.data.html_url,
      };
    } catch (error) {
      return { error };
    }
  },
};

export default updatePR;
