import { Octokit } from "@octokit/rest";

export async function getCommitDetails() {
  const octokit = new Octokit({
    auth: process.env["GITHUB_TOKEN"],
  });

  const owner = process.env["GITHUB_REPOSITORY"]?.split("/")[0] || "";
  const repo = process.env["GITHUB_REPOSITORY"]?.split("/")[1] || "";
  const sha = process.env["COMMIT_SHA"] || "";

  try {
    const commitResponse = await octokit.repos.getCommit({
      owner,
      repo,
      ref: sha,
    });

    const compareResponse = await octokit.repos.compareCommits({
      owner,
      repo,
      base: `${sha}^`,
      head: sha,
    });

    return {
      title: commitResponse.data.commit.message.split("\n")[0],
      message: commitResponse.data.commit.message,
      author: commitResponse.data.commit.author,
      stats: commitResponse.data.stats,
      diff: compareResponse.data.files,
      sha: commitResponse.data.sha,
    };
  } catch (error) {
    console.error("Error fetching commit details:", error);
    process.exit(1);
  }
}
