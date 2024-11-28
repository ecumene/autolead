import { reviewPullRequest } from "./pr-review/review-pull-request";

import { getPullRequestDetails } from "./summarize-pull-request.ci";

const pullRequest = await getPullRequestDetails();

reviewPullRequest(
  pullRequest.diff
    ?.map((file) => `- ${file.filename} (${file.status})`)
    .join("\n") || ""
);
