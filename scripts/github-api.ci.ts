import { Octokit } from "@octokit/rest";

export async function getRepoIssuesAndPRs(): Promise<{
  issues: any[];
  prs: any[];
}> {
  const octokit = new Octokit({
    auth: process.env["GITHUB_TOKEN"],
  });

  const owner = process.env["GITHUB_REPOSITORY"]?.split("/")[0] || "";
  const repo = process.env["GITHUB_REPOSITORY"]?.split("/")[1] || "";

  try {
    // Get open issues
    const issues = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
      per_page: 100,
    });

    // Get open PRs
    const pulls = await octokit.pulls.list({
      owner,
      repo,
      state: "open",
      per_page: 100,
    });

    console.log("Open Issues:");
    issues.data.forEach((issue) => {
      if (!issue.pull_request) {
        // Filter out PRs from issues list
        console.log(`#${issue.number} - ${issue.title}`);
      }
    });

    console.log("\nOpen Pull Requests:");
    pulls.data.forEach((pr) => {
      console.log(`#${pr.number} - ${pr.title}`);
    });

    return { issues: issues.data, prs: pulls.data };
  } catch (error) {
    console.error("Error fetching issues and PRs:", error);
    process.exit(1);
  }
}
