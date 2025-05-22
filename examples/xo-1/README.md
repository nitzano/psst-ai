# XO Example Project

This project demonstrates the use of [XO](https://github.com/xojs/xo) for linting a TypeScript project.

## Features

- Configured XO linting with custom rules
- TypeScript support
- Sample code following XO linting standards
- Tests using Vitest

## Getting Started

```bash
# Install dependencies
pnpm install

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Run tests
pnpm test
```

## Configuration

XO is configured in the `xo.config.js` file with the following settings:

- Using 2 spaces for indentation
- Using semicolons
- TypeScript support enabled
- Node.js and browser environments
- Custom rule overrides

## Project Structure

- `src/` - Source code
- `tests/` - Test files
- `xo.config.js` - XO configuration
- `.nvmrc` - Node.js version specification
