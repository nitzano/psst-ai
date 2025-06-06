<h1 align="center">🤫 psst-ai</h1>
<h2 align="center"> Whisper AI code instructions from codebase to editor</h2>

<div align="center">

[![npm](https://img.shields.io/npm/v/prisma-openapi)](https://www.npmjs.com/package/psst-ai)
[![GitHub Repo stars](https://img.shields.io/github/stars/nitzano/psst-ai?style=flat)](https://github.com/nitzano/psst-ai/stargazers)
![npm](https://img.shields.io/npm/dw/psst-ai)
![GitHub License](https://img.shields.io/github/license/nitzano/psst-ai)

</div>

Automatically extract coding conventions and preferences from your project and generate tailored instructions for AI code assistants like GitHub Copilot, Cursor, and more.

## 🌟 Features

- 🔍 **Zero Configuration**: Just run the CLI and it automatically detects your project's setup
- 📝 **Generates Instructions**: Creates a markdown file with AI-ready instructions
- 🚀 **Editor Integration**: Works seamlessly with GitHub Copilot, Cursor, Windsurf, and other AI assistants
- 🎯 **Deep Project Analysis**: Detects 14+ different aspects including frameworks (Next.js, Vue), testing tools (Jest, AVA), databases (Prisma), UI libraries (Tailwind), and state management (Zustand)
- 🔧 **Smart Configuration Detection**: Automatically identifies project conventions from config files, package.json, and code patterns
- 📁 **Multi-Language Support**: Works with JavaScript, TypeScript, and detects specific build tools, linters, and development workflows



## 💡 Why Use psst-ai?

- **No More Repetition**: Stop typing the same instructions every time you chat with AI
- **Consistency**: Ensure all team members give the same instructions to AI assistants
- **Time Saver**: Automatically detect project conventions without manual effort
- **Project Onboarding**: Help new team members understand coding standards through AI
- **Lightweight & Fast**: Focused CLI design means quick installation and execution

## 🚀 Quick Start

```bash
# Run directly without installing (recommended)
npx psst-ai

# Or with pnpm
pnpm dlx psst-ai

# Or with yarn
yarn dlx psst-ai

# Specify a custom directory to scan
npx psst-ai /path/to/your/project
```

**Want to install globally?**
```bash
pnpm add -g psst-ai    # or npm install -g psst-ai
```

That's it! The tool will:
1. Scan your project files and configuration
2. Detect coding conventions and preferences 
3. Print the AI-ready instructions directly to your terminal

## 📄 Generated Instructions Format

After running the tool, you'll see instructions printed to your terminal based on your project's conventions. The output is organized by category and provides specific, actionable guidance:

```markdown
## Linting
- Use eslint for linting.

## Next.js
- Use Next.js as the React framework.
- Use the App Router directory structure in Next.js.
- Use React strict mode in Next.js.

## Node Version
- Use the nodejs version specified in the .nvmrc file (v22.15.1).

## Package Manager
- Use pnpm as the package manager.

## Tailwind CSS
- Use Tailwind CSS utility classes for styling. Keep custom CSS minimal and prefer utility-first approach.
- Using @tailwindcss/forms plugin. This provides better default styling for form elements.

## Testing
- Use vitest testing framework.
```

The instructions are automatically generated based on what psst-ai detects in your project - configuration files, dependencies, file patterns, and coding conventions.

## 🧩 What's Detected?

Currently, psst-ai can detect:
See [our scanners documentation](./docs/SCANNERS.md) for a complete list of everything psst-ai can detect.

## 🔧 How to Use the Generated Instructions



### Method 1: Copy and Paste
1. **Copy** the output from your terminal
2. **Paste** into your AI assistant's instructions panel:
   - GitHub Copilot: Chat instructions
   - Cursor: Workspace instructions
   - VS Code AI Assistant: Custom instructions
   - Other AI coding tools: Custom prompts section

### Method 2: Automatic File Updates

Insert the start and end tags `<!-- PSST-AI-INSTRUCTIONS-START -->` and `<!-- PSST-AI-INSTRUCTIONS-END -->` in your instruction file, and psst-ai will replace the content between these tags with the generated instructions.

```markdown
# Coding Guidelines for This Project

<!-- PSST-AI-INSTRUCTIONS-START -->
<!-- Your AI instructions will be inserted here -->
<!-- PSST-AI-INSTRUCTIONS-END -->
```

## 🧰 Editors Integration

Before: paste the [instruction tags](#method-2-automatic-file-updates) (including both start and end tags) into your instructions file and run the command in your favorite editor:


### VSCode
For VS Code's GitHub Copilot Chat, place your instructions file in `.github/copilot-instructions.md` and run:
```bash
npx psst-ai -f ./.github/copilot-instructions.md
```

### Cursor
For Cursor AI, place your instructions file in `.cursor/rules/ai-instructions.mdc` and run:
```bash
npx psst-ai -f ./.cursor/rules/ai-instructions.mdc
```

### Windsurf
For Windsurf AI, place your instructions file in `.windsurf/rules/ai-instructions.md` and run:
```bash
npx psst-ai -f ./.windsurf/ai-instructions.md
```

## Command Options

```
  -o, --output <path>  Save output to a file
  --no-header          Flatten output without category headers
  -f, --file <path>    File path to update with AI instructions
```

