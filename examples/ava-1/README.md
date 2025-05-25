# AVA Example 1

This example demonstrates AVA configuration through package.json.

## Features

- File pattern configuration
- Concurrency settings
- Timeout configuration
- TypeScript support with path rewriting
- Watch mode configuration
- Custom require modules
- Test matching patterns

## Configuration

The AVA configuration is defined in the `ava` section of `package.json`:

```json
{
  "ava": {
    "files": [
      "tests/**/*.test.js",
      "!tests/fixtures/**/*"
    ],
    "concurrency": 4,
    "timeout": "30s",
    "verbose": true,
    "require": [
      "./test-setup.js"
    ],
    "match": [
      "*integration*",
      "!*unit*"
    ],
    "typescript": {
      "rewritePaths": {
        "src/": "dist/"
      },
      "compile": "tsc"
    },
    "watchMode": {
      "ignoreChanges": [
        "dist/**/*",
        "coverage/**/*"
      ]
    }
  }
}
```

## Running Tests

```bash
npm test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:verbose  # Run tests with verbose output
```
