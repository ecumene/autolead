import Agent from "./Agent";

const agent = new Agent({
  prompt: `Just spit back the summary of the commit the user gives you in a simple summary`,
  tools: [],
});

export default agent;
