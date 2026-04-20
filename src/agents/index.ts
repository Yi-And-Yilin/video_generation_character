import type { AgentConfig } from "@opencode-ai/sdk";

import { DEFAULT_MODEL } from "@/utils/config";
import { VIDEO_GENERATION_AGENT_NAME, videoGenerationAgent } from "./my-primary-agent";
import { MY_SUBAGENT_AGENT_NAME, mySubagentAgent } from "./my-subagent";
import { DESIGN_CHARACTERS_AGENT_NAME, designCharactersAgent } from "./design_characters";
import { DESIGN_SCENES_AGENT_NAME, designScenesAgent } from "./design_scenes";
import { DESIGN_SHOTS_FOR_EACH_SCENE_AGENT_NAME, designShotsForEachSceneAgent } from "./design_shots_for_each_scene";
import { DESIGN_IMAGE_PROMPTS_FOR_EACH_SHOT_AGENT_NAME, designImagePromptsForEachShotAgent } from "./design_image_prompts_for_each_shot";
import { DESIGN_VIDEO_PROMPTS_FOR_EACH_SHOT_AGENT_NAME, designVideoPromptsForEachShotAgent } from "./design_video_prompts_for_each_shot";
import { SCENE_QA_AGENT_NAME, sceneQaAgent } from "./scene_qa";

export const agents: Record<string, AgentConfig> = {
  [VIDEO_GENERATION_AGENT_NAME]: { ...videoGenerationAgent, model: DEFAULT_MODEL },
  [MY_SUBAGENT_AGENT_NAME]: { ...mySubagentAgent, model: DEFAULT_MODEL },
  [DESIGN_CHARACTERS_AGENT_NAME]: { ...designCharactersAgent, model: DEFAULT_MODEL },
  [DESIGN_SCENES_AGENT_NAME]: { ...designScenesAgent, model: DEFAULT_MODEL },
  [DESIGN_SHOTS_FOR_EACH_SCENE_AGENT_NAME]: { ...designShotsForEachSceneAgent, model: DEFAULT_MODEL },
  [DESIGN_IMAGE_PROMPTS_FOR_EACH_SHOT_AGENT_NAME]: { ...designImagePromptsForEachShotAgent, model: DEFAULT_MODEL },
  [DESIGN_VIDEO_PROMPTS_FOR_EACH_SHOT_AGENT_NAME]: { ...designVideoPromptsForEachShotAgent, model: DEFAULT_MODEL },
  [SCENE_QA_AGENT_NAME]: { ...sceneQaAgent, model: DEFAULT_MODEL },
};

export {
  videoGenerationAgent,
  mySubagentAgent,
  VIDEO_GENERATION_AGENT_NAME,
  MY_SUBAGENT_AGENT_NAME,
  DESIGN_CHARACTERS_AGENT_NAME,
  designCharactersAgent,
  DESIGN_SCENES_AGENT_NAME,
  designScenesAgent,
  DESIGN_SHOTS_FOR_EACH_SCENE_AGENT_NAME,
  designShotsForEachSceneAgent,
  DESIGN_IMAGE_PROMPTS_FOR_EACH_SHOT_AGENT_NAME,
  designImagePromptsForEachShotAgent,
  DESIGN_VIDEO_PROMPTS_FOR_EACH_SHOT_AGENT_NAME,
  designVideoPromptsForEachShotAgent,
  SCENE_QA_AGENT_NAME,
  sceneQaAgent,
};