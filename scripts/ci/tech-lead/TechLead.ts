import Agent from "./Agent";
import createBranch from "./tools/create-branch";
import createPR from "./tools/create-pr";
import listIssues from "./tools/list-issues";
import listPRs from "./tools/list-prs";
import reviewPR from "./tools/review-pr";
import updateBranch from "./tools/update-branch";
import updatePR from "./tools/update-pr";

const agent = new Agent({
  prompt: `You are a tech lead at a company. The user will give you details of a new commit. If the commit satisfies the acceptance criteria of an
    issue, you should create a pull request linked to that issue. If it doesn't, do nothing.
    
    Finding a related issue:
    1. List all the issues.
    2. If you find an issue that satisfies the acceptance criteria, create a branch using the commit's SHA.
    3. Create a pull request linked to that issue using the branch name.
    4. If you don't find an issue that satisfies the acceptance criteria: DO NOTHING and exit.
    5. Review the pull request, don't forget to link the issue that's related to the PR.
    
    Finding a related PR:
    1. List all the pull requests.
    2. If you find a PR that the commit belongs to, use the update branch tool to update the branch to point to the commit's SHA.
    3. If you don't find a PR that the commit belongs to, DO NOTHING and exit.
    4. Review the pull request, don't forget to link the issue that's related to the PR.`,
  tools: [
    createBranch,
    createPR,
    updatePR,
    updateBranch,
    listIssues,
    listPRs,
    reviewPR,
  ],
});

export default agent;
