import { Octokit } from "@octokit/rest";

export async function getPullRequestDetails() {
  const octokit = new Octokit({
    auth: process.env["GITHUB_TOKEN"],
  });

  const owner = process.env["GITHUB_REPOSITORY"]?.split("/")[0] || "";
  const repo = process.env["GITHUB_REPOSITORY"]?.split("/")[1] || "";
  const pullNumber = parseInt(process.env["PULL_REQUEST_NUMBER"] || "0");

  try {
    const prResponse = await octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });

    const diffResponse = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
    });

    return {
      title: prResponse.data.title,
      description: prResponse.data.body || "",
      author: {
        name: prResponse.data.user?.login,
        email: prResponse.data.user?.email,
      },
      stats: {
        additions: diffResponse.data.reduce(
          (sum, file) => sum + file.additions,
          0
        ),
        deletions: diffResponse.data.reduce(
          (sum, file) => sum + file.deletions,
          0
        ),
        total: diffResponse.data.reduce((sum, file) => sum + file.changes, 0),
      },
      diff: diffResponse.data.map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch,
      })),
      number: pullNumber,
      sha: prResponse.data.head.sha,
    };
  } catch (error) {
    console.error("Error fetching pull request details:", error);
    process.exit(1);
  }
}
