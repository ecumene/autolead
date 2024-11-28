import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env["GITHUB_TOKEN"],
});

const owner = process.env["GITHUB_REPOSITORY"]?.split("/")[0] || "";
const repo = process.env["GITHUB_REPOSITORY"]?.split("/")[1] || "";

export { octokit, owner, repo };
