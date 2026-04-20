---
name: tool-creation
description: Create tools for the micode OpenCode plugin - extending agent capabilities with custom functionality
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: tool-creation
---

# Creating Tools

Tools extend agent capabilities by providing specific functionality - file operations, API calls, search, etc.

## Overview

Tools in micode are defined using the plugin SDK's `tool()` function. They provide focused functionality that agents can call.

## When to Create a Tool

Create a tool when you need:
- File operations (read, write, extract)
- Search functionality
- External API calls
- Process management (PTY sessions)
- Any reusable, focused action

Keep tools single-purpose. If an action is complex, consider making it a subagent instead.

## Tool Structure

```typescript
import { tool } from "@opencode-ai/plugin/tool";
import { extractErrorMessage } from "@/utils/errors";

export const my_tool = tool({
  description: "What this tool does",
  args: {
    param1: tool.schema.string().describe("Description of param1"),
    param2: tool.schema.number().optional().describe("Optional parameter"),
  },
  execute: async (args) => {
    const { param1, param2 } = args;

    try {
      // Tool logic
      const result = doSomething(param1, param2);

      return `## Success

**Result**: ${result}`;
    } catch (error) {
      return `## Error

**Message**: ${extractErrorMessage(error)}`;
    }
  },
});
```

## Tool Schema Types

Available schema types from `tool.schema`:

| Type | Method | Description |
|------|--------|-------------|
| string | `.string()` | Text input |
| number | `.number()` | Numeric input |
| boolean | `.boolean()` | True/false |
| array | `.array(schema)` | List of items |
| object | `.object({ ... })` | Nested object |
| enum | `.enum([...])` | One of specified values |
| optional | `.optional()` | Makes param optional |

## Error Handling

Always use `extractErrorMessage` from `@/utils/errors`:

```typescript
import { extractErrorMessage } from "@/utils/errors";

catch (error) {
  return `## Error

**File**: ${filePath}
**Error**: ${extractErrorMessage(error)}`;
}
```

## Common Patterns

### File Writing Tool

```typescript
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { tool } from "@opencode-ai/plugin/tool";
import { extractErrorMessage } from "@/utils/errors";

export const write_design_file = tool({
  description: "Write design document to file",
  args: {
    full_design: tool.schema.string().describe("Full design content"),
    topic: tool.schema.string().describe("Topic for filename"),
  },
  execute: async (args) => {
    const { full_design, topic } = args;
    const datePrefix = getDatePrefix(); // YYYY-MM-DD
    const filename = `${datePrefix}-${topic}-design.md`;
    const filePath = join("thoughts", "shared", "designs", filename);

    try {
      writeFileSync(filePath, full_design, "utf-8");
      return `## Success\n\n**File**: \`${filePath}\``;
    } catch (error) {
      return `## Error\n\n**Error**: ${extractErrorMessage(error)}`;
    }
  },
});
```

### Search Tool

```typescript
import { tool } from "@opencode-ai/plugin/tool";

export const artifact_search = tool({
  description: "Search past plans and ledgers",
  args: {
    query: tool.schema.string().describe("Search query"),
    limit: tool.schema.number().optional().describe("Max results"),
    type: tool.schema.enum(["all", "plan", "ledger"]).optional(),
  },
  execute: async (args) => {
    const { query, limit = 10, type = "all" } = args;
    // Search logic
    return formattedResults;
  },
});
```

### Lookup Tool

```typescript
import { tool } from "@opencode-ai/plugin/tool";

export const look_at = tool({
  description: "Extract key information from a file",
  args: {
    filePath: tool.schema.string().describe("File to extract from"),
    extract: tool.schema.string().optional().describe("What to extract"),
  },
  execute: async (args) => {
    const { filePath, extract } = args;
    // Extraction logic
    return extractedInfo;
  },
});
```

## Tool Naming

Tool names should:
- Use snake_case (e.g., `write_design_file`, `artifact_search`)
- Be descriptive of the action
- Match the export name

## Registration Steps (Complete Checklist)

### Step 1: Create Tool File

Create `src/tools/my-tool.ts` with the tool definition.

### Step 2: Register in `src/tools/index.ts`

```typescript
// Add import
import { my_tool } from "./my-tool";

// Add to tools export
export const tools = {
  // ... existing tools
  my_tool,
};
```

### Step 3: Update README.md

Add to the Tools table:

```markdown
| `my_tool` | Description of what it does |
```

## Tool Usage in Agents

Tools are used by agents through the tool call syntax:

```xml
<tool-call>
  write_design_file({ full_design: "...", topic: "my-topic" })
</tool-call>
```

## Testing Tools

```typescript
import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { write_design_file } from "../../src/tools/write-design-file";

describe("write_design_file", () => {
  const testDir = "/tmp/test-designs";

  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it("should write design file", async () => {
    const result = await write_design_file.execute({
      full_design: "# Test Design",
      topic: "test",
    });
    expect(result).toContain("Success");
  });

  it("should handle errors gracefully", async () => {
    const result = await write_design_file.execute({
      full_design: "test",
      topic: "",  // Invalid
    });
    expect(result).toContain("Error");
  });
});
```

## Common Mistakes

| Mistake | Why It's a Problem | Fix |
|---------|-------------------|-----|
| Forgetting to register | Tool not available | Always register in index.ts |
| Forgetting README update | Users don't know it exists | Update Tools table |
| Not using extractErrorMessage | Inconsistent error format | Use the utility |
| Not handling errors | Tool crashes on failure | Always wrap in try/catch |
| Wrong schema type | Validation fails | Use correct types |
| Complex tool logic | Hard to debug | Keep single-purpose |

## Best Practices

| Practice | Description |
|----------|-------------|
| **Single Responsibility** | One tool, one purpose |
| **Error Handling** | Always catch and format errors |
| **Schema Validation** | Use appropriate types |
| **Descriptive Names** | `write_design_file` not `write` |
| **Extract Errors** | Use `extractErrorMessage()` |
| **Consistent Output** | Use markdown format for results |

## Reference Examples

| Tool | File | Purpose |
|------|------|---------|
| write_design_file | `src/tools/write-design-file.ts` | File writing |
| artifact_search | `src/tools/artifact-search.ts` | Search |
| look_at | `src/tools/look-at.ts` | File extraction |
| pty_spawn | `src/tools/pty.ts` | PTY session |