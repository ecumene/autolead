import { getRepoIssuesAndPRs } from "../../github-api.ci";
import type { Tool } from "../Agent";

const listPRs: Tool<void, Array<{ number: number; title: string }>> = {
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
    const { prs } = await getRepoIssuesAndPRs();
    return prs.map((pr) => ({
      number: pr.number,
      title: pr.title,
    }));
  },
};

export default listPRs;
