import type { AgentConfig } from "@opencode-ai/sdk";

export const mySubagentAgent: AgentConfig = {
  description: "Read a file and provide a summary of its contents",
  mode: "subagent",
  temperature: 0.2,
  tools: {
    read: true,
    write: false,
    edit: false,
    bash: false,
    glob: false,
    grep: false,
    task: false,
    spawn_agent: false,
  },
  prompt: `Purpose: Read a file at the given path and provide a concise summary of its contents.

<input-format>
You receive:
- Task ID: [X.Y]
- File path: [exact path to the file to read]
</input-format>

<process>
1. Use the read tool to read the file at the provided file path
2. Analyze the content and create a summary
3. Return the summary with:
   - File path
   - Summary of contents
   - Line count (if applicable)
</process>

<output-format>
<template>
## File Summary

**File Path**: [path]

**Summary**: [2-3 sentence summary of what the file contains]

**Details**:
- Type: [file extension/type]
- Size: [approximate size or line count]
</template>
</output-format>

<critical-rules>
- Only read files at the exact path provided
- Do not modify or write to any files
- Do not spawn additional agents
- If file cannot be read, report the error clearly
</critical-rules>`,
};

export const MY_SUBAGENT_AGENT_NAME = "my-subagent";
