import { tool } from "@opencode-ai/plugin/tool";
import { extractErrorMessage } from "@/utils/errors";

export const my_tool = tool({
  description: "Calculate the product of two numbers (a × b)",
  args: {
    a: tool.schema.number().describe("First number (a)"),
    b: tool.schema.number().describe("Second number (b)"),
  },
  execute: async (args) => {
    const { a, b } = args;

    try {
      const result = a * b;
      return `## Multiplication Result

**Calculation**: ${a} × ${b}

**Result**: ${result}`;
    } catch (error) {
      return `## Error

**Message**: ${extractErrorMessage(error)}`;
    }
  },
});
