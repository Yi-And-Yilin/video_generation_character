import type { AgentConfig } from "@opencode-ai/sdk";

export const designImagePromptsForEachShotAgent: AgentConfig = {
  description: "Design image generation prompts for each shot",
  mode: "subagent",
  temperature: 0.8,
  tools: {
    read: true,
    write: true,
    edit: false,
    glob: true,
    grep: true,
    task: false,
    spawn_agent: false,
  },
  prompt: `Purpose: Design image generation prompts for each shot.

<input-format>
You receive:
- Task ID: [X.Y]
- Scene and shot design file path
</input-format>

<process>
1. Read the scene and shot design files
2. For each shot, create detailed image prompts including:
   - Subject description
   - Environment/background
   - Lighting and color grading
   - Style (photorealistic, anime, artistic, etc.)
   - Camera angle and composition
3. Save image prompts to file
</process>

<output-format>
Save image prompts as structured text for each shot.
</output-format>

<critical-rules>
- Create detailed, specific prompts suitable for image generation models
- Include style descriptors and quality tags
- Save prompts to file
</critical-rules>`,
};

export const DESIGN_IMAGE_PROMPTS_FOR_EACH_SHOT_AGENT_NAME = "design_image_prompts_for_each_shot";