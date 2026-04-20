---
name: set-default-primary-agent
description: Set the default primary agent and change agent sequence in the micode OpenCode plugin
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: agent-configuration
---

# Set Default Primary Agent and Change Agent Sequence

This skill explains how to configure which primary agent is the default and how to change the order of agents in the micode plugin.

## Overview

When OpenCode starts, it uses a default primary agent. The order of agents in the config also matters - the first primary agent in the list is used as the default unless explicitly set via `default_agent`.

## Key Concepts

### Default Agent (`default_agent`)

The `default_agent` config field explicitly sets which primary agent to use when none is specified. This is set in the plugin's `config` function:

```typescript
config.default_agent = "my-primary-agent";
```

### Agent Order in `config.agent`

The order in which agents are added to `config.agent` determines:
1. Which agent is used as default (first primary agent, unless `default_agent` is set)
2. The order shown in the OpenCode agent selector UI

```typescript
config.agent = {
  ...config.agent,                    // OpenCode defaults first
  "my-primary-agent": agents["my-primary-agent"],  // First - becomes default
  "second-agent": agents["second-agent"],           // Second
  ...Object.entries(agents).filter(([k]) => k !== "my-primary-agent"),  // Rest
};
```

## How to Set Default Agent

### Step 1: Import the agent name constant

In `src/index.ts`, import the agent name from the agents index:

```typescript
import { agents, MY_PRIMARY_AGENT_NAME } from "@/agents";
```

### Step 2: Add to config.agent first

Put the desired default agent first in the `config.agent` object:

```typescript
config.agent = {
  ...config.agent,
  [MY_PRIMARY_AGENT_NAME]: agents[MY_PRIMARY_AGENT_NAME],
  ...Object.fromEntries(
    Object.entries(agents).filter(([k]) => k !== MY_PRIMARY_AGENT_NAME)
  ),
};
```

### Step 3: Explicitly set default_agent (recommended)

Always set `config.default_agent` to ensure the correct agent is used:

```typescript
config.default_agent = MY_PRIMARY_AGENT_NAME;
```

## How to Change Agent Sequence

### Using Object Spread Order

The order of agents in `config.agent` determines their sequence. Use `Object.fromEntries` with `Object.entries` to filter and reorder:

```typescript
config.agent = {
  ...config.agent,
  // Put desired agent first
  [DESIRED_AGENT_NAME]: agents[DESIRED_AGENT_NAME],
  // Rest of agents, excluding the one we already added
  ...Object.fromEntries(
    Object.entries(agents).filter(([k]) => k !== DESIRED_AGENT_NAME)
  ),
};
```

### Multiple Agents Reordering

To put multiple agents at the start in specific order:

```typescript
const orderedAgents = ["agent-a", "agent-b", "agent-c"];
const remainingAgents = Object.entries(agents).filter(
  ([k]) => !orderedAgents.includes(k)
);

const reorderedAgents = [
  ...orderedAgents.map((name) => [name, agents[name]]),
  ...remainingAgents,
];

config.agent = {
  ...config.agent,
  ...Object.fromEntries(reorderedAgents),
};
```

## Complete Example

Here's a complete `src/index.ts` showing how to set default agent and sequence:

```typescript
import type { Plugin } from "@opencode-ai/plugin";

import { agents, MY_PRIMARY_AGENT_NAME, MY_SUBAGENT_AGENT_NAME } from "@/agents";

const OpenCodeConfigPlugin: Plugin = async (_ctx) => {
  return {
    tool: {},

    config: async (config) => {
      config.permission = {
        ...config.permission,
        edit: "allow",
        bash: "allow",
        webfetch: "allow",
        external_directory: "allow",
      };

      // Set default agent first in the list
      config.agent = {
        ...config.agent,
        [MY_PRIMARY_AGENT_NAME]: agents[MY_PRIMARY_AGENT_NAME],
        [MY_SUBAGENT_AGENT_NAME]: agents[MY_SUBAGENT_AGENT_NAME],
        ...Object.fromEntries(
          Object.entries(agents).filter(
            ([k]) => k !== MY_PRIMARY_AGENT_NAME && k !== MY_SUBAGENT_AGENT_NAME
          )
        ),
      };

      // Explicitly set default agent
      config.default_agent = MY_PRIMARY_AGENT_NAME;

      config.mcp = {};
    },
  };
};

export { OpenCodeConfigPlugin };
```

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Wrong agent is default | Agent not first in `config.agent` order | Reorder or set `default_agent` explicitly |
| Agent not in list | Agent not registered in `src/agents/index.ts` | Add agent to agents index |
| `default_agent` ignored | Agent not a primary agent | Ensure agent has `mode: "primary"` |

## Rebuild Required

After changing `src/index.ts`, always rebuild the plugin:

```bash
bun run build
```
