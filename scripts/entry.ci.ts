import { getRepoIssuesAndPRs } from "./github-api.ci";
import { summarizeIssuesAndPRs } from "./tech-lead.ci";

getRepoIssuesAndPRs().then((issuesAndPRs) => {
  summarizeIssuesAndPRs(issuesAndPRs.issues, issuesAndPRs.prs);
});
