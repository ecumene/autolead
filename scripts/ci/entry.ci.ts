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

for await (const message of TechLead.chat({
  role: "user",
  content: `I have a new commit:\n${formattedCommit}`,
})) {
  console.log(message);
}
