---
name: compile-plugin
description: Build instructions for the micode OpenCode plugin
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: build
---

# Compile Plugin

Build the micode plugin for use in OpenCode configuration.

## Build Command

Run from project root:

```bash
bun run build
```

This compiles `src/index.ts` to `dist/index.js` using Bun's bundler with `bun-pty` marked as external (runtime-provided by OpenCode).

## Output

- **Entry point**: `dist/index.js`
- **Target**: Bun runtime format
- **External dependencies**: `bun-pty` (provided by OpenCode host)

## OpenCode Configuration

After compiling, reference the plugin using the absolute path:

```json
{
  "plugin": ["C:/micode/dist"]
}
```

Or in `opencode.json` at any level:

```json
{
  "plugins": [
    "C:/micode/dist"
  ]
}
```

## Alternative: Global Install

For system-wide use without path references:

```bash
npm install -g
# Then use:
{ "plugin": ["mycode"] }
```

## Clean Build

Remove compiled output:

```bash
bun run clean
```

## Watch Mode

For development, rebuild on file changes:

```bash
bun build src/index.ts --outdir dist --target bun --external bun-pty --watch
```

## Verification

After build, verify the output exists:

```bash
ls dist/index.js
```

The compiled file should be ~500KB+ and contain the bundled plugin code.

## Troubleshooting

### Build fails with "bun-pty" errors

This is expected if running outside OpenCode. The `--external bun-pty` flag correctly excludes it since OpenCode provides this native module at runtime.

### Plugin not loading

Ensure the path uses forward slashes (`C:/micode/dist`) not backslashes (`C:\micode\dist`) in JSON configuration.

### Type errors during build

Run `bun run typecheck` to see TypeScript errors without producing output.
