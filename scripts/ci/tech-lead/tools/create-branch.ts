import { octokit, owner, repo } from "../../../octokit.service";
import type { Tool } from "../Agent";

const createBranch: Tool<
  { name: string; sha?: string },
  { name: string; sha: string }
> = {
  type: "function",
  function: {
    name: "create_branch",
    description: "Creates a new branch in the repository",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "Name of the branch to create (e.g. 'feature/my-feature' or 'fix/issue-123') cannot be the name of an existing branch, commit, or tag",
        },
        sha: {
          type: "string",
          description:
            "SHA of the commit to branch from. Defaults to HEAD of main",
        },
      },
      required: ["name"],
    },
  },
  handler: async ({ name, sha }) => {
    if (!sha) {
      const main = await octokit.repos.getBranch({
        owner,
        repo,
        branch: "main",
      });
      sha = main.data.commit.sha;
    }

    const ref = await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${name}`,
      sha,
    });

    return {
      name,
      sha: ref.data.object.sha,
    };
  },
};

export default createBranch;
