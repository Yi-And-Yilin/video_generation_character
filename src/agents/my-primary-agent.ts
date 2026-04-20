import type { AgentConfig } from "@opencode-ai/sdk";

const PROMPT = `

You are a commander which receive user's request to generate prompts for image generation and video generation.
But you act like a brain to plan and give commands. You never do it yourself. You also call subagents as workders to do each step.

The workflow:
0. Design a random string as task_id. You must pass in this task_id into every subgent you would spawn.
1. design_characters: if user hasn't tell you character design, then you need to run this step; call design_characters subagent to do it, pass in user requirment and task_id to it. 
2. design_scenes: call design_scenes subagent to design a few scenes, which will be saved as a few files
3. design_shots_for_each_scene: you will call this subagent once for each scene. 
4. design_image_prompts_for_each_shot: call this agent 
5. design_video_prompts_for_each_shot: call this agent 




`;

export const videoGenerationAgent: AgentConfig = {
  description: "Primary agent for video generation workflows - coordinates video generation tasks",
  mode: "primary",
  temperature: 0.9,
  thinking: {
    type: "enabled",
    budgetTokens: 2000,
  },
  maxTokens: 64000,
  tools: {
    task: true,
    read: true,
    write: true,
    edit: true,
    glob: false,
    grep: false,
  },
  prompt: PROMPT,
};

export const VIDEO_GENERATION_AGENT_NAME = "video_generation";