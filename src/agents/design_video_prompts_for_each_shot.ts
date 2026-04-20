import type { AgentConfig } from "@opencode-ai/sdk";

export const designVideoPromptsForEachShotAgent: AgentConfig = {
  description: "Design video generation prompts for each shot",
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
  prompt: `Purpose: Design video generation prompts for each shot.

<input-format>
You receive:
- Task ID: [X.Y]
- Scene and shot design file path
- Image prompts for the shot (if available)
</input-format>

<process>
1. Read the scene and shot design files and image prompts
2. For each shot, create video generation prompts including:
   - Motion description (what moves in the scene)
   - Camera movement details
   - Duration/timing
   - Transition hints to next shot
   - Style consistency with image prompts
3. Save video prompts to file
</process>

<output-format>
Save video prompts as structured text for each shot.
</output-format>

<critical-rules>
- Create prompts suitable for video generation models
- Emphasize motion and temporal elements
- Save prompts to file
</critical-rules>`,
};

export const DESIGN_VIDEO_PROMPTS_FOR_EACH_SHOT_AGENT_NAME = "design_video_prompts_for_each_shot";