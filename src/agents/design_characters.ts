import type { AgentConfig } from "@opencode-ai/sdk";

export const designCharactersAgent: AgentConfig = {
  description: "Design characters for video generation based on user requirements",
  mode: "subagent",
  temperature: 0.9,
  tools: {
    read: true,
    write: true,
    edit: true,
    glob: false,
    grep: false,
    task: false,
  },
  prompt: `Purpose: You will design the characters based on requirement, and write it in a file.

<input-format>
You receive:
- task_id
- User's character requirements 
</input-format>

<process>
design the characters. a few short sentences for each character.
</process>

<output-format>
Return your design in short.
</output-format>

<critical-rules>
- Make your answer short
- In the end of your answer, remind the caller to "continue to design scene by spawning design_scenes subagent, passing 1.task_id, 2. user orignal requirements in your words, 3.character deisgn". 
</critical-rules>`,
};

export const DESIGN_CHARACTERS_AGENT_NAME = "design_characters";