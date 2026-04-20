import type { PluginInput, ToolDefinition } from "@opencode-ai/plugin";
import { type ToolContext, tool } from "@opencode-ai/plugin/tool";
import { extractErrorMessage } from "@/utils/errors";
import { SCENE_QA_AGENT_NAME } from "@/agents";

type ExtendedContext = ToolContext & {
  metadata?: (input: { title?: string; metadata?: Record<string, unknown> }) => void;
};

const MS_PER_SECOND = 1000;

interface SessionCreateResponse {
  readonly data?: { readonly id?: string };
}

interface MessagePart {
  readonly type: string;
  readonly text?: string;
}

interface SessionMessage {
  readonly info?: { readonly role?: "user" | "assistant" };
  readonly parts?: MessagePart[];
}

interface SessionMessagesResponse {
  readonly data?: SessionMessage[];
}

async function executeAgentSession(ctx: PluginInput, prompt: string): Promise<string> {
  const sessionResp = (await ctx.client.session.create({
    body: {},
    query: { directory: ctx.directory },
  })) as SessionCreateResponse;

  const sessionID = sessionResp.data?.id;
  if (!sessionID) {
    return "## scene_qa\n\n**Error**: Failed to create session";
  }

  await ctx.client.session.prompt({
    path: { id: sessionID },
    body: {
      parts: [{ type: "text", text: prompt }],
      agent: SCENE_QA_AGENT_NAME,
    },
    query: { directory: ctx.directory },
  });

  const messagesResp = (await ctx.client.session.messages({
    path: { id: sessionID },
    query: { directory: ctx.directory },
  })) as SessionMessagesResponse;

  const messages = messagesResp.data || [];
  const lastAssistant = messages.filter((m) => m.info?.role === "assistant").pop();
  const agentResponse =
    lastAssistant?.parts
      ?.filter((p) => p.type === "text" && p.text)
      .map((p) => p.text)
      .join("\n") || "(No response from agent)";

  await ctx.client.session
    .delete({ path: { id: sessionID }, query: { directory: ctx.directory } })
    .catch((_e: unknown) => {
      /* fire-and-forget */
    });

  return agentResponse;
}

export function createSceneQaTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: `Spawn the scene_qa subagent to perform QA on video scenes.

Example:
scene_qa({
  prompt: "Review the scene configuration for scene 1 and check for consistency issues",
  description: "QA scene 1"
})`,
    args: {
      prompt: tool.schema.string().describe("Full prompt/instructions for the scene_qa agent"),
      description: tool.schema.string().describe("Short description of the QA task"),
    },
    execute: async (args, toolCtx) => {
      const { prompt, description } = args;
      const extCtx = toolCtx as ExtendedContext;

      if (!prompt) return "## scene_qa Failed\n\nNo prompt provided.";

      const startTime = Date.now();
      extCtx.metadata?.({ title: `Running scene_qa: ${description || "QA task"}...` });

      try {
        const agentOutput = await executeAgentSession(ctx, prompt);
        const agentTime = ((Date.now() - startTime) / MS_PER_SECOND).toFixed(1);
        return `## scene_qa: ${description || "QA task"} (${agentTime}s)\n\n### Result\n\n${agentOutput}`;
      } catch (error) {
        const errorMsg = extractErrorMessage(error);
        return `## scene_qa: ${description || "QA task"}\n\n**Error**: ${errorMsg}`;
      }
    },
  });
}