# Note on Copying This Plugin

If you copy this folder to start a new plugin, remember that the initial setup has already been performed. You will need to manually update the following references:

1.  **Search and Replace**: Search for `video-generation-character` across the entire folder and replace it with your new plugin name. Key files include:
    *   `package.json` (the `name` field and `repository` URL)
    *   `README.md`
    *   Any documentation or source files referencing the name.
2.  **Git History**: This folder contains a `.git` directory with the history of `video-generation-character`. For a new plugin, you should:
    *   Delete the `.git` folder.
    *   Run `git init` to start a fresh history.
3.  **Dependencies**: It is recommended to delete the `node_modules` folder before copying to save time, then run `bun install` in the new location.

**Pro-tip**: To avoid manual renaming, it is often easier to clone the original template again:
`git clone https://github.com/zenobi-us/opencode-plugin-template.git my-new-plugin`
