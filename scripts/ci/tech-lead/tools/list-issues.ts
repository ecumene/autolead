import { octokit, owner, repo } from "../../../octokit.service";
import type { Tool } from "../Agent";

const listIssues: Tool<void, Array<{ number: number; title: string }>> = {
  type: "function",
  function: {
    name: "list_issues",
    description: "Lists all open issues in the repository",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  handler: async () => {
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
    });
    return issues.map((issue) => ({
      number: issue.number,
      title: issue.title,
    }));
  },
};

export default listIssues;
