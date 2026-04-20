---
name: primary-agent-creation
description: Create primary agents for the micode OpenCode plugin - orchestrators that spawn subagents and drive workflows
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: agent-creation
---

# Creating Primary Agents

Primary agents are the main orchestrators in micode. They spawn subagents, drive workflows, and coordinate between different phases.

## Overview

Primary agents differ from subagents in that they:
- Use `Task tool` to spawn subagents
- Have full tool access (except `spawn_agent` is disabled)
- Drive the overall workflow
- Have higher temperature for creativity (0.2-0.7)

## When to Create a Primary Agent

Create a primary agent when you need:
- Orchestrate multiple phases/steps
- Spawn and coordinate subagents
- Drive a complete workflow (brainstorm → plan → implement)
- Make decisions that affect the whole workflow

Otherwise, create a subagent for focused single-purpose tasks.

## AgentConfig Structure

```typescript
import type { AgentConfig } from "@opencode-ai/sdk";

const PROMPT = `<environment>
You are running as part of the "micode" OpenCode plugin.
Available micode agents: planner, executor, implementer, reviewer, codebase-locator, etc.
Use Task tool with subagent_type matching these agent names to spawn them.
</environment>

<identity>
You are [Agent Name] - a [role description].
- [Key behavioral traits]
</identity>

<workflow>
<phase name="phase-name" trigger="when to enter">
<action>What to do in this phase</action>
<output>Expected output</output>
</phase>
</workflow>

... more sections ...
`;

export const myPrimaryAgent: AgentConfig = {
  description: "Clear description of what this agent does",
  mode: "primary",
  temperature: 0.2,  // Lower for decision-making, higher for creativity
  thinking: {
    type: "enabled",
    budgetTokens: 64000,  // Enable thinking for complex decisions
  },
  maxTokens: 64000,
  tools: {
    spawn_agent: false,  // Primary agents use Task tool, not spawn_agent
  },
  prompt: PROMPT,
};

export const MY_PRIMARY_AGENT_NAME = "my-primary-agent";
```

## Primary vs Subagent Configuration

| Aspect | Primary Agent | Subagent |
|--------|--------------|----------|
| **mode** | `"primary"` | `"subagent"` |
| **tools** | Most enabled, `spawn_agent: false` | Restricted based on purpose |
| **Spawn Method** | `Task tool` | `spawn_agent tool` |
| **Temperature** | 0.2-0.7 | 0.1-0.3 |
| **Thinking** | Often enabled | Usually disabled |

## Prompt Structure

All micode agent prompts follow a structured format:

```xml
<environment>
<!-- Platform context, available agents/tools -->
</environment>

<identity>
<!-- Role definition, behavioral traits -->
</identity>

<purpose>
<!-- What this agent accomplishes -->
</purpose>

<critical-rules>
<!-- Non-negotiable rules -->
</critical-rules>

<process>
<!-- Execution phases -->
</process>

<output-format>
<!-- Expected output format -->
</output-format>

<never-do>
<!-- Forbidden behaviors -->
</never-do>
```

## Workflow Phases

Define clear phases for the agent's operation:

```xml
<workflow>
<phase name="clarifying" trigger="FIRST on new topic">
<action>Ask questions to understand requirements</action>
</phase>

<phase name="research" trigger="After clarifying">
<action>Spawn subagents to gather context</action>
<action>Use Task tool for parallel execution</action>
</phase>

<phase name="executing" trigger="After research">
<action>Make decisions and delegate</action>
</phase>
</workflow>
```

## Subagent Spawning

Primary agents spawn subagents using the Task tool:

```xml
<Task(subagent_type="planner", prompt="Create plan for...", description="Create plan")>
<Task(subagent_type="codebase-locator", prompt="Find files...", description="Find files")>
<!-- Multiple spawns in one message execute in parallel -->
```

## Tools Configuration

Typical primary agent tools:

```typescript
tools: {
  spawn_agent: false,  // Use Task tool instead
  // Other tools enabled as needed
}
```

## Registration Steps (Complete Checklist)

### Step 1: Create Agent File

Create `src/agents/my-primary-agent.ts` with the AgentConfig.

### Step 2: Register in `src/agents/index.ts`

```typescript
// Add import at the top
import { MY_PRIMARY_AGENT_NAME, myPrimaryAgent } from "./my-primary-agent";

// Add to agents record
export const agents: Record<string, AgentConfig> = {
  // ... existing agents
  [MY_PRIMARY_AGENT_NAME]: { ...myPrimaryAgent, model: DEFAULT_MODEL },
};

// Add to exports at bottom
export { myPrimaryAgent };
```

### Step 3: Update README.md

Add to the Agents table:

```markdown
| commander-adv | Orchestrator (advanced) |
```

### Step 4: Add to Agent Aliases (if backward compatibility needed)

If this is a variant of an existing agent and you want `old-name` → `new-name` mapping:

Edit `src/config-loader.ts` in the `AGENT_ALIASES` section:

```typescript
export const AGENT_ALIASES: Record<string, string> = {
  "old-name": "new-name",  // Add this line
  // ...
};
```

### Step 5: Add to Fragment Injector (if custom fragments needed)

If this agent needs custom prompt fragments:

Edit `src/fragment-injector.ts`:

```typescript
const FRAGMENT_PATHS: Record<string, string[]> = {
  "my-primary-agent": ["custom-fragment.md"],
  // ...
};
```

### Step 6: Update Other Agents' available-agents List

If other agents need to know about this new agent (e.g., commander needs to spawn it):

Edit the `<agents>` section in other agent prompts to include the new agent.

## Testing

```typescript
import { describe, expect, it } from "bun:test";
import { myPrimaryAgent } from "../../src/agents/my-primary-agent";

describe("myPrimaryAgent", () => {
  it("should be configured as primary", () => {
    expect(myPrimaryAgent.mode).toBe("primary");
  });

  it("should have temperature set", () => {
    expect(myPrimaryAgent.temperature).toBeLessThanOrEqual(0.7);
  });

  it("should disable spawn_agent", () => {
    expect(myPrimaryAgent.tools?.spawn_agent).toBe(false);
  });

  it("should have workflow phases in prompt", () => {
    expect(myPrimaryAgent.prompt).toContain("phase name");
  });

  it("should be registered in agents index", async () => {
    const { agents } = await import("../../src/agents/index");
    expect(agents["my-primary-agent"]).toBeDefined();
  });
});
```

## Common Mistakes

| Mistake | Why It's a Problem | Fix |
|---------|-------------------|-----|
| Forgetting to register in index.ts | Agent not available | Always register |
| Forgetting to export | Import fails | Add export statement |
| Forgetting README update | Users don't know it exists | Update Agents table |
| Wrong mode | Agent behaves incorrectly | Use `"primary"` |
| Enabling spawn_agent | Violates architecture | Set `spawn_agent: false` |
| Not disabling unused tools | Security risk | Disable unnecessary tools |

## Reference Examples

| Agent | File | Complexity |
|-------|------|-----------|
| commander-adv | `src/agents/commander-adv.ts` | High |
| brainstormer-adv | `src/agents/brainstormer-adv.ts` | High |
| planner | `src/agents/planner.ts` | High |
| executor | `src/agents/executor.ts` | High |