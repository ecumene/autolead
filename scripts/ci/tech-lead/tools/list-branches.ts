import { octokit, owner, repo } from "../../../octokit.service";
import type { Tool } from "../Agent";

const listBranches: Tool<
  void,
  Array<{ name: string; sha: string }> | { error: unknown }
> = {
  type: "function",
  function: {
    name: "list_branches",
    description: "Lists all branches in the repository",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  handler: async () => {
    try {
      const { data: branches } = await octokit.repos.listBranches({
        owner,
        repo,
      });
      return branches.map((branch) => ({
        name: branch.name,
        sha: branch.commit.sha,
      }));
    } catch (error) {
      return { error };
    }
  },
};

export default listBranches;
