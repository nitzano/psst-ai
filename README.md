# 🤫 psst-ai

> CLI tool that generates AI instructions from your codebase

Automatically extract coding conventions and preferences from your project and generate tailored instructions for AI code assistants like GitHub Copilot, Cursor, and more.

## 🌟 Features

- 🔍 **Zero Configuration**: Just run the CLI and it automatically detects your project's setup
- 📦 **Detects Package Managers**: Identifies whether you use npm, yarn, or pnpm
- 🔢 **Finds Node Versions**: Extracts Node.js version requirements from your .nvmrc file
- 🧹 **Recognizes Linting Tools**: Detects ESLint, XO, and other linting configurations
- 🧪 **Identifies Testing Frameworks**: Recognizes Jest, Vitest, and other testing setups
- 📝 **Generates Instructions**: Creates a markdown file with AI-ready instructions

## 💡 Why Use psst-ai?

- **No More Repetition**: Stop typing the same instructions every time you chat with AI
- **Consistency**: Ensure all team members give the same instructions to AI assistants
- **Time Saver**: Automatically detect project conventions without manual effort
- **Project Onboarding**: Help new team members understand coding standards through AI
- **Lightweight & Fast**: Focused CLI design means quick installation and execution

## 📦 Installation

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
# Run in your project root directory
psst-ai

# Or specify a custom directory to scan
psst-ai /path/to/your/project
```

That's it! The tool will:
1. Scan your project files and configuration
2. Detect coding conventions and preferences 
3. Generate an `output/copilot-instructions.md` file with AI-ready instructions

## 📄 Generated Instructions Format

After running the tool, you'll get a markdown file with clear instructions based on your project's conventions:

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

1. **Copy** the contents of `output/copilot-instructions.md`
2. **Paste** into your AI assistant's instructions panel:
   - GitHub Copilot: Chat instructions
   - Cursor: Workspace instructions
   - VS Code AI Assistant: Custom instructions
   - Other AI coding tools: Custom prompts section

## 🧩 What's Detected?

Currently, psst-ai can detect:

| Category | Examples |
| -------- | -------- |
| Package Managers | npm, yarn, pnpm |
| Node.js Versions | From .nvmrc file |
| Linting Tools | ESLint, XO, StandardJS |
| Testing Frameworks | Jest, Vitest, Mocha |

## 🛠️ Development

psst-ai is a pure CLI tool with TypeScript support. To contribute:

```bash
# Clone the repository
git clone https://github.com/yourusername/psst-ai.git
cd psst-ai

# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build the project
pnpm build

# Run the built version
pnpm start
```

## 🧪 Advanced Usage: Programmatic Access

While psst-ai is primarily designed as a CLI tool, you can also import its components for advanced use cases:

```typescript
// Import the scanner
import { Scanner } from 'psst-ai/dist/cli.js';

// Create a scanner instance
const scanner = new Scanner('/path/to/project');

// Run the scanner
await scanner.run();
```

This can be useful for integrating psst-ai into your own tools or workflows.

## 📝 License

AGPL
