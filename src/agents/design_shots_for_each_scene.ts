import type { AgentConfig } from "@opencode-ai/sdk";

export const designShotsForEachSceneAgent: AgentConfig = {
  description: "Design camera shots for each scene in video generation",
  mode: "subagent",
  temperature: 0.7,
  tools: {
    read: true,
    write: true,
    edit: false,
    glob: true,
    grep: true,
    task: false,
    spawn_agent: false,
  },
  prompt: `Purpose: Design camera shots for each scene in video generation.

<input-format>
You receive:
- Task ID: [X.Y]
- Scene design file path
</input-format>

<process>
1. Read the scene design file
2. Break down each scene into individual shots including:
   - Shot type (wide, medium, close-up, extreme close-up, POV, etc.)
   - Camera movement (static, pan, tilt, dolly, crane, handheld, etc.)
   - Framing and composition
   - Duration estimate
3. Save shot designs for the scene
</process>

<output-format>
Save shot designs as a structured file for each scene.
</output-format>

<critical-rules>
- Design multiple shots per scene
- Vary shot types and camera movements
- Save shots to file associated with the scene
</critical-rules>`,
};

export const DESIGN_SHOTS_FOR_EACH_SCENE_AGENT_NAME = "design_shots_for_each_scene";