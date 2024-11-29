# Autolead

An AI Agent "Tech-Lead" in a Github Repo

I love coding. I loathe project management.

- Opening and closing issues
- Updating PRs
- Keeping stakeholders updated in Slack

These things suck. What if we could make an AI do it?

## How it works

1. Commit to any branch other than main.
2. An LLM will try to create a PR using your git commits.
3. It will link that PR to a Github Issue if one matches.
4. If your PR appears to address the issue, it will close it.
5. It will open new issues if need-be.

## How to set it up

- [ ] Clone this repo
- [ ] Enable Github Actions for the repo
- [ ] Set an OPENAI_API_KEY in your repo's settings
- [ ] Enjoy total coding agency
