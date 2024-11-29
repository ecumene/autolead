import { octokit, owner, repo } from "../../../octokit.service";
import type { Tool } from "../Agent";

const updateBranch: Tool<
  { name: string; sha: string },
  { name: string; sha: string } | { error: unknown }
> = {
  type: "function",
  function: {
    name: "update_branch",
    description: "Updates an existing branch to point to a new commit SHA",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the branch to update",
        },
        sha: {
          type: "string",
          description: "New SHA that the branch should point to",
        },
      },
      required: ["name", "sha"],
    },
  },
  handler: async ({ name, sha }) => {
    try {
      await octokit.git.updateRef({
        owner,
        repo,
        ref: `refs/heads/${name}`,
        sha,
        force: true,
      });

      return {
        name,
        sha,
      };
    } catch (error) {
      return { error };
    }
  },
};

export default updateBranch;
