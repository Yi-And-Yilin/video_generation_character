---
name: subagent-creation
description: Create subagents for the micode OpenCode plugin - specialized agents spawned by primary agents for specific tasks
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: agent-creation
---

# Creating Subagents

Subagents are specialized agents spawned by primary agents (like commander, brainstormer) to handle specific tasks.

## Overview

Subagents differ from primary agents in that they:
- Are spawned by primary agents via Task tool
- Have restricted tool access
- Focus on single responsibilities
- Use lower temperature (0.1-0.3)

## When to Create a Subagent

Create a subagent when you need:
- A focused, single-purpose task
- QA or review functionality
- Research or analysis
- Execution of micro-tasks

Create a primary agent if you need orchestration and workflow coordination.

## Subagent Types

| Type | Examples | Responsibility | Complexity |
|------|----------|----------------|------------|
| **Research** | `codebase-locator`, `codebase-analyzer`, `pattern-finder` | Find information | Low |
| **Execution** | `implementer`, `reviewer` | Execute specific tasks | Medium |
| **Analysis** | `design-qa`, `plan-qa`, `final-review` | Quality/checking | Medium |
| **Utility** | `ledger-creator`, `artifact-searcher` | State/search | Low |

## AgentConfig Structure

```typescript
import type { AgentConfig } from "@opencode-ai/sdk";

export const mySubagentAgent: AgentConfig = {
  description: "Clear description of responsibilities",
  mode: "subagent",
  temperature: 0.2,  // Low temp for focused tasks
  tools: {
    write: false,
    edit: false,
    task: false,  // subagent cannot use Task tool
    spawn_agent: false,
  },
  prompt: `...`,
};

export const MY_SUBAGENT_AGENT_NAME = "my-subagent";
```

## Primary vs Subagent

| Aspect | Primary Agent | Subagent |
|--------|--------------|----------|
| **Spawn Method** | `Task tool` | `spawn_agent tool` (by primary) |
| **Available Tools** | All tools | Restricted tools |
| **Spawn Other Agents** | Yes (using Task) | No (can only be spawned) |
| **Temperature** | 0.2-0.7 | 0.1-0.3 |
| **Typical Prompt Length** | Long (1000+ lines) | Medium (200-500 lines) |

## Prompt Structure

```xml
<environment>
<!-- Declare environment, available agents -->
</environment>

<purpose>
<!-- Clear purpose: what you accomplish -->
</purpose>

<critical-rules>
<!-- Most important rules -->
</critical-rules>

<process>
<!-- Execution flow by phase -->
</process>

<output-format>
<!-- Output format requirements -->
</output-format>

<never-do>
<!-- Forbidden items -->
</never-do>
```

## Tools Restriction

Subagents should have restricted tools based on their purpose:

### Read-only (Research type)
```typescript
tools: {
  write: false,
  edit: false,
  bash: false,
  task: false,
  spawn_agent: false,
}
```

### Execution type
```typescript
tools: {
  write: true,
  edit: true,
  bash: true,
  task: false,  // but cannot use Task tool
  spawn_agent: false,
}
```

### QA type (may need bash for running tests)
```typescript
tools: {
  write: false,
  edit: false,
  task: false,
  spawn_agent: false,
  bash: true,  // may need for running tests
}
```

## Input/Output Patterns

### Standardized Input Format
```xml
<input-format>
You receive:
- Task ID: [X.Y]
- File path: [exact path]
- Test path: [exact path]
- Complete code (copy-paste ready)
</input-format>
```

### Standardized Output Format
```xml
<output-format>
<template>
## Task [X.Y]: [file name]
**Status**: PASS / FAIL
**Test result**: [output]
</template>
</output-format>
```

## Special Patterns

### Self-Adaptation (Implementer)
```xml
<adaptation-rules>
When plan doesn't match reality, TRY TO ADAPT before escalating:

<adapt situation="File at different path">
  Action: Use Glob to find correct path
  Report: "Plan said X, found at Y. Proceeding with Y."
</adapt>

<escalate situation="Fundamental mismatch">
  Action: Report mismatch, stop
</escalate>
</adaptation-rules>
```

### Fix Suggestions (Reviewer)
```xml
<fix-suggestions>
Every issue MUST include:

Issue: What's wrong
Why it matters: Impact
Fix: Specific action
Code: Before/after snippet
</fix-suggestions>
```

## Registration Steps (Complete Checklist)

### Step 1: Create Agent File

Create `src/agents/my-subagent.ts` with the AgentConfig.

### Step 2: Register in `src/agents/index.ts`

```typescript
// Add import at the top
import { MY_SUBAGENT_AGENT_NAME, mySubagentAgent } from "./my-subagent";

// Add to agents record
export const agents: Record<string, AgentConfig> = {
  // ... existing agents
  [MY_SUBAGENT_AGENT_NAME]: { ...mySubagentAgent, model: DEFAULT_MODEL },
};

// Add to exports at bottom
export { mySubagentAgent };
```

### Step 3: Update README.md

Add to the Agents table:

```markdown
| plan-qa | QA for implementation plans |
```

### Step 4: Add to Agent Aliases (if backward compatibility needed)

If this is replacing an existing agent:

Edit `src/config-loader.ts` in the `AGENT_ALIASES` section:

```typescript
export const AGENT_ALIASES: Record<string, string> = {
  "old-name": "new-name",  // Add this line
  // ...
};
```

### Step 5: Update Other Agents' available-agents List

If primary agents need to spawn this subagent, update their `<available-subagents>` section:

```xml
<available-subagents>
  <subagent name="my-subagent">Description</subagent>
</available-subagents>
```

## Testing

```typescript
import { describe, expect, it } from "bun:test";
import { mySubagentAgent } from "../../src/agents/my-subagent";

describe("mySubagentAgent", () => {
  it("should be configured as subagent", () => {
    expect(mySubagentAgent.mode).toBe("subagent");
  });

  it("should have description", () => {
    expect(mySubagentAgent.description).toBeDefined();
  });

  it("should disable Task tool", () => {
    expect(mySubagentAgent.tools?.task).toBe(false);
  });

  it("should disable spawn_agent", () => {
    expect(mySubagentAgent.tools?.spawn_agent).toBe(false);
  });

  it("should have input/output formats", () => {
    expect(mySubagentAgent.prompt).toContain("input-format");
    expect(mySubagentAgent.prompt).toContain("output-format");
  });

  it("should be registered in agents index", async () => {
    const { agents } = await import("../../src/agents/index");
    expect(agents["my-subagent"]).toBeDefined();
  });
});
```

## Common Mistakes

| Mistake | Why It's a Problem | Fix |
|---------|-------------------|-----|
| Forgetting to register in index.ts | Agent not available | Always register |
| Enabling Task tool | Violates architecture | Set `task: false` |
| Enabling spawn_agent | Violates architecture | Set `spawn_agent: false` |
| Too high temperature | Reduces consistency | Use 0.1-0.3 |
| Wrong tool permissions | Security risk or broken functionality | Match tools to purpose |
| Forgetting README update | Users don't know it exists | Update Agents table |

## Reference Examples

| Agent | File | Type | Complexity |
|-------|------|------|-------------|
| `codebase-locator` | `src/agents/codebase-locator.ts` | Research | Low |
| `design-qa` | `src/agents/design-qa.ts` | Analysis | Medium |
| `plan-qa` | `src/agents/plan-qa.ts` | Analysis | Medium |
| `implementer` | `src/agents/implementer.ts` | Execution | Medium |
| `reviewer` | `src/agents/reviewer.ts` | Execution | Medium |
| `ledger-creator` | `src/agents/ledger-creator.ts` | Utility | Medium |