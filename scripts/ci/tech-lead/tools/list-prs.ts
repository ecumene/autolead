import { octokit, owner, repo } from "../../../octokit.service";
import type { Tool } from "../Agent";

const listPRs: Tool<
  void,
  Array<{ number: number; title: string }> | { error: unknown }
> = {
  type: "function",
  function: {
    name: "list_prs",
    description: "Lists all open pull requests in the repository",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  handler: async () => {
    try {
      const { data: prs } = await octokit.pulls.list({
        owner,
        repo,
        state: "open",
      });
      return prs.map((pr) => ({
        number: pr.number,
        title: pr.title,
      }));
    } catch (error) {
      return { error };
    }
  },
};

export default listPRs;
