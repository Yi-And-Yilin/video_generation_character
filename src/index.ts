import type { Plugin } from "@opencode-ai/plugin";

import { agents, VIDEO_GENERATION_AGENT_NAME } from "@/agents";
import { createSceneQaTool, my_tool } from "@/tools";

const PLUGIN_COMMANDS = {
  help: {
    description: "Show available commands",
    agent: "my-subagent",
    template: "Show help. $ARGUMENTS",
  },
};

const OpenCodeConfigPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      my_tool,
      scene_qa: createSceneQaTool(ctx),
    },

    config: async (config) => {
      config.permission = {
        ...config.permission,
        edit: "allow",
        bash: "allow",
        webfetch: "allow",
        external_directory: "allow",
      };

      config.agent = {
        ...config.agent,
        [VIDEO_GENERATION_AGENT_NAME]: agents[VIDEO_GENERATION_AGENT_NAME],
        ...Object.fromEntries(Object.entries(agents).filter(([k]) => k !== VIDEO_GENERATION_AGENT_NAME)),
      };

      config.default_agent = VIDEO_GENERATION_AGENT_NAME;

      config.mcp = {};

      config.command = { ...config.command, ...PLUGIN_COMMANDS };
    },
  };
};

export { OpenCodeConfigPlugin };