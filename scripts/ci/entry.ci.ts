console.log(`hello world, you have committed to ${process.env.COMMIT_SHA}`);

import { getCommitDetails } from "./summarize-commit.ci.ts";
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
  onMessage: (message) => {
    console.log(`${message.role}: ${message.content}`);
  },
});

for await (const _message of await TechLead.chat({
  role: "user",
  content: `I have a new commit:\n${formattedCommit}`,
})) {
  // do nothing
}
