import { getCommitDetails } from "./summarize-commit.ci";
import TechLead from "./tech-lead/TechLead";

const latestCommit = await getCommitDetails();

const formattedCommit = `Title: ${latestCommit.title}
Message: ${latestCommit.message}
Author: ${latestCommit.author?.name} (${latestCommit.author?.email})
Stats: ${latestCommit.stats?.total} additions, ${
  latestCommit.stats?.deletions
} deletions
Diff: ${latestCommit.diff
  ?.map((file) => `- ${file.filename} (${file.status})`)
  .join("\n")}
SHA: ${latestCommit.sha}`;

TechLead.addListener({
  onFunctionCall: (toolCall, params) => {
    console.log("Tool call: ", toolCall.function.name);
    const parsedParams = Object.entries(JSON.parse(params as string));
    if (parsedParams.length > 0) {
      console.log("\n| Parameter | Value |");
      console.log("|-----------|--------|");
      parsedParams.forEach(([key, value]) => {
        console.log(`| ${key} | ${value} |`);
      });
    }
  },
  onFunctionResult: (result) => {
    console.log("Function result: ", result);
  },
  onMessage: (message) => {
    console.log(message);
  },
});

for await (const _message of await TechLead.chat({
  role: "user",
  content: `I have a new commit:\n${formattedCommit}`,
})) {
  // do nothing
}
