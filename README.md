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
- 📦 **Detects Package Managers**: Identifies whether you use npm, yarn, or pnpm
- 🔢 **Finds Node Versions**: Extracts Node.js version requirements from your .nvmrc file
- 🧹 **Recognizes Linting Tools**: Detects ESLint, XO, and other linting configurations
- 🧪 **Identifies Testing Frameworks**: Recognizes Jest, Vitest, and other testing setups
- 📝 **Generates Instructions**: Creates a markdown file with AI-ready instructions
- And more...

## 💡 Why Use psst-ai?

- **No More Repetition**: Stop typing the same instructions every time you chat with AI
- **Consistency**: Ensure all team members give the same instructions to AI assistants
- **Time Saver**: Automatically detect project conventions without manual effort
- **Project Onboarding**: Help new team members understand coding standards through AI
- **Lightweight & Fast**: Focused CLI design means quick installation and execution

## 📦 Setup

```bash
# Install globally with pnpm (recommended)
pnpm add -g psst-ai

# Or with npm
npm install -g psst-ai

# Or with yarn
yarn global add psst-ai
```

## 🚀 Usage

```bash
# Run using npx without installing
npx psst-ai

# Or with pnpm
pnpm dlx psst-ai

# Or with yarn
yarn dlx psst-ai

# Specify a custom directory to scan
npx psst-ai /path/to/your/project

# Generate instructions and update editor-specific files
npx psst-ai --editor github
```

### Command Options

- `-o, --output <path>` - Save output to a file
- `-q, --quiet` - Suppress console output
- `-v, --verbose` - Show verbose output
- `--no-header` - Flatten output without category headers
- `-f, --file <path>` - Load file with sections to update

That's it! The tool will:
1. Scan your project files and configuration
2. Detect coding conventions and preferences 
3. Print the AI-ready instructions directly to your terminal

## 📄 Generated Instructions Format

After running the tool, you'll see instructions printed to your terminal based on your project's conventions:

```markdown
## Package Manager
Use pnpm as the package manager.

## Node Version
Use the nodejs version specified in the .nvmrc file.

## Linting
Use xo for linting.

## Testing
Use vitest testing framework.
```

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

## Additional Project-Specific Guidelines
...
```

## 🧰 Editors Integration


### VSCode
For VS Code's GitHub Copilot Chat, place your instructions file in `.github/copilot-instructions.md` and run:
```bash
npx psst-ai -f ./.github/copilot-instructions.md
```

### Cursor
For Cursor AI, place your instructions file in `.cursor/rules/ai-instructions.mdc` and run:
```bash
npx psst-ai -f ./.cursor/ai-settings.json
```

### Windsurf
For Windsurf AI, place your instructions file in `.windsurf/rules/ai-instructions.md` and run:
```bash
npx psst-ai -f ./.windsurf/ai-instructions.md
```

## 🧩 What's Detected?

Currently, psst-ai can detect:

| Category | Examples |
| -------- | -------- |
| Package Managers | npm, yarn, pnpm |
| Node.js Versions | From .nvmrc file |
| Linting Tools | ESLint, XO, StandardJS |
| Testing Frameworks | Jest, Vitest, Mocha |



