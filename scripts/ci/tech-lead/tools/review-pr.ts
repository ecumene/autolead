import { octokit, owner, repo } from "../../../octokit.service";
import { reviewPullRequest } from "../../pr-review/review-pull-request";
import type { Tool } from "../Agent";

const reviewPR: Tool<
  { number: number; issueNumber: number },
  {
    approved: boolean;
    reason: string;
    suggestedChanges?: Array<{
      file: string;
      line?: number;
      suggestion: string;
    }>;
  }
> = {
  type: "function",
  function: {
    name: "review_pr",
    description: "Reviews a pull request and provides feedback",
    parameters: {
      type: "object",
      properties: {
        number: {
          type: "number",
          description: "The pull request number to review",
        },
        issueNumber: {
          type: "number",
          description: "The issue number that the pull request is related to",
        },
      },
      required: ["number", "issueNumber"],
    },
  },
  handler: async ({ number, issueNumber }) => {
    const files = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: number,
    });

    const issue = await octokit.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    const diffContent = files.data
      .map((file) => `${file.filename} (${file.status})\n${file.patch || ""}`)
      .join("\n\n");

    const review = await reviewPullRequest(diffContent, issue.data.body ?? "");

    if (!review) {
      return {
        approved: false,
        reason: "No review returned",
      };
    }

    // Create the review on GitHub
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: number,
      body: review.reason,
      event: review.approved ? "APPROVE" : "REQUEST_CHANGES",
      comments: review.suggestedChanges?.map((change) => ({
        path: change.file,
        line: change.line || 1,
        body: change.suggestion,
      })),
    });

    // If approved, merge the PR
    if (review.approved) {
      await octokit.pulls.merge({
        owner,
        repo,
        pull_number: number,
        merge_method: "squash", // You can change this to 'merge' or 'rebase' if preferred
      });
    }

    return {
      approved: review.approved,
      reason: review.reason,
      suggestedChanges: review.suggestedChanges,
    };
  },
};

export default reviewPR;
