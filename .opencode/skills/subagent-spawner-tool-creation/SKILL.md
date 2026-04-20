---
name: subagent-spawner-tool-creation
description: Create tools that spawn specific subagents - delegating tasks to specialized agents
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: tool-creation
---

# Creating Subagent-Spawner Tools

A subagent-spawner tool delegates work to a specialized subagent by creating a session and sending it a prompt. This pattern is useful when you want to offload specific tasks (like QA, analysis, or specialized processing) to a dedicated agent.

## Overview

Unlike regular tools that perform actions directly, subagent-spawner tools:
- Create a new agent session
- Send a prompt to a specialized subagent
- Retrieve and return the agent's response
- Clean up the session afterward

## When to Create a Subagent-Spawner Tool

Create one when you need:
- Complex task execution that benefits from a dedicated agent
- QA or validation workflows
- Analysis tasks requiring specialized prompts
- Parallel processing capabilities (multiple agents)
- Any task where the agent's reasoning capabilities are needed

## The Pattern

### 1. First, Create the Subagent

Before creating the spawner tool, define the subagent:

```typescript
// src/agents/my_subagent.ts
import type { AgentConfig } from "@opencode-ai/sdk";

export const mySubagentAgent: AgentConfig = {
  description: "Description of what this subagent does",
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
  prompt: `Purpose: What this subagent is designed to do.

<input-format>
You receive:
- Task context and parameters
</input-format>

<process>
1. Step 1 the subagent takes
2. Step 2 the subagent takes
</process>

<output-format>
Provide structured output with findings.
</output-format>

<critical-rules>
- Do not modify files unless asked
- Be thorough in analysis
</critical-rules>`,
};

export const MY_SUBAGENT_AGENT_NAME = "my-subagent";
```

### 2. Register the Subagent

Add to `src/agents/index.ts`:

```typescript
import { MY_SUBAGENT_AGENT_NAME, mySubagentAgent } from "./my_subagent";

// Add to agents record
export const agents: Record<string, AgentConfig> = {
  // ... existing agents
  [MY_SUBAGENT_AGENT_NAME]: { ...mySubagentAgent, model: DEFAULT_MODEL },
};

// Add to exports
export {
  MY_SUBAGENT_AGENT_NAME,
  mySubagentAgent,
};
```

### 3. Create the Spawner Tool

```typescript
// src/tools/my_subagent_spawner.ts
import type { PluginInput, ToolDefinition } from "@opencode-ai/plugin";
import { type ToolContext, tool } from "@opencode-ai/plugin/tool";
import { extractErrorMessage } from "@/utils/errors";
import { MY_SUBAGENT_AGENT_NAME } from "@/agents";

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
  // 1. Create a new session
  const sessionResp = (await ctx.client.session.create({
    body: {},
    query: { directory: ctx.directory },
  })) as SessionCreateResponse;

  const sessionID = sessionResp.data?.id;
  if (!sessionID) {
    return "## Error\n\nFailed to create session";
  }

  // 2. Send prompt to the agent
  await ctx.client.session.prompt({
    path: { id: sessionID },
    body: {
      parts: [{ type: "text", text: prompt }],
      agent: MY_SUBAGENT_AGENT_NAME,  // Use constant, not hardcoded string
    },
    query: { directory: ctx.directory },
  });

  // 3. Retrieve response messages
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

  // 4. Cleanup: Delete session (fire-and-forget)
  await ctx.client.session
    .delete({ path: { id: sessionID }, query: { directory: ctx.directory } })
    .catch((_e: unknown) => {
      /* fire-and-forget */
    });

  return agentResponse;
}

export function createMySubagentSpawnerTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: `Spawn the my-subagent subagent to perform specific tasks.

Example:
my_subagent_spawner({
  prompt: "Detailed instructions for the subagent",
  description: "Short task description"
})`,
    args: {
      prompt: tool.schema.string().describe("Full prompt/instructions for the subagent"),
      description: tool.schema.string().describe("Short description of the task"),
    },
    execute: async (args, toolCtx) => {
      const { prompt, description } = args;
      const extCtx = toolCtx as ExtendedContext;

      if (!prompt) return "## Failed\n\nNo prompt provided.";

      const startTime = Date.now();
      extCtx.metadata?.({ title: `Running my-subagent: ${description || "task"}...` });

      try {
        const agentOutput = await executeAgentSession(ctx, prompt);
        const agentTime = ((Date.now() - startTime) / MS_PER_SECOND).toFixed(1);
        return `## my-subagent: ${description || "task"} (${agentTime}s)\n\n### Result\n\n${agentOutput}`;
      } catch (error) {
        const errorMsg = extractErrorMessage(error);
        return `## my-subagent: ${description || "task"}\n\n**Error**: ${errorMsg}`;
      }
    },
  });
}
```

### 4. Register the Tool

In `src/tools/index.ts`:

```typescript
export { createMySubagentSpawnerTool } from "./my_subagent_spawner";
```

In `src/index.ts`:

```typescript
import { createMySubagentSpawnerTool } from "@/tools";

// In OpenCodeConfigPlugin:
tool: {
  my_tool,
  my_subagent_spawner: createMySubagentSpawnerTool(ctx),
},
```

## Session Pattern Explanation

The session pattern follows these steps:

1. **Create Session**: `ctx.client.session.create()` - creates a new agent session
2. **Send Prompt**: `ctx.client.session.prompt()` - sends the prompt to the specified agent
3. **Get Messages**: `ctx.client.session.messages()` - retrieves the agent's response
4. **Delete Session**: `ctx.client.session.delete()` - cleanup (fire-and-forget)

The agent name should always use the exported constant (e.g., `MY_SUBAGENT_AGENT_NAME`) rather than a hardcoded string.

## Error Handling

Always wrap in try/catch and use `extractErrorMessage`:

```typescript
try {
  const result = await executeAgentSession(ctx, prompt);
  return result;
} catch (error) {
  return `## Error\n\n**Message**: ${extractErrorMessage(error)}`;
}
```

## Tool Naming Convention

- Tool files: `snake_case.ts` (e.g., `scene_qa.ts`)
- Factory function: `create{Something}Tool` (e.g., `createSceneQaTool`)
- Agent name: `kebab-case` (e.g., `scene-qa`)

## Key Differences from Regular Tools

| Aspect | Regular Tool | Subagent-Spawner Tool |
|--------|-------------|----------------------|
| Execution | Direct code | Creates agent session |
| Complexity | Simple actions | Complex reasoning |
| Session | No | Yes (create/prompt/messages/delete) |
| Agent reference | N/A | Uses agent constant |

## Complete Example: scene_qa

See these files for a complete reference:

- `src/agents/scene_qa.ts` - The subagent definition
- `src/tools/scene_qa.ts` - The spawner tool

## Testing the Tool

Once created, test by calling the tool:

```
scene_qa({
  prompt: "Review the scene configuration for scene 1...",
  description: "QA scene 1"
})
```

The tool will:
1. Create a new session
2. Send the prompt to the `scene_qa` subagent
3. Return the agent's response formatted with timing info

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Hardcoding agent name | fragile if name changes | Use exported constant |
| Forgetting to register agent | agent not available | Add to src/agents/index.ts |
| Forgetting tool registration | tool not available | Add to src/index.ts tool config |
| No error handling | crashes on failure | Wrap in try/catch |
| Wrong PluginInput usage | context missing | Pass `ctx` from plugin factory |

## Reference

For a multi-agent spawner (spawning multiple agents in parallel), see `C:\micode\src\tools\spawn-agent.ts`.