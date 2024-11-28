import { getRepoIssuesAndPRs } from "./github-api.ci";
import { summarizeIssuesAndPRs } from "./tech-lead.ci";

const githubIssuesAndPRs = await getRepoIssuesAndPRs();
console.log(
  await summarizeIssuesAndPRs(githubIssuesAndPRs.issues, githubIssuesAndPRs.prs)
);
