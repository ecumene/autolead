import Agent from "./Agent";
import listIssues from "./tools/list-issues";

const agent = new Agent({
  prompt: `You are a tech lead at a company. The user will give you details of a new commit. If the commit satisfies the acceptance criteria of an
    issue, you should create a pull request linked to that issue. If it doesn't, do nothing.
    
    1. List all the issues.
    2. If you find an issue that satisfies the acceptance criteria, create a branch using the commit's SHA.
    3. Create a pull request linked to that issue using the branch name.
    4. If you don't find an issue that satisfies the acceptance criteria, DO NOTHING and exit.`,
  tools: [listIssues],
});

export default agent;
