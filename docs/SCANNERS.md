- [List of scanners](#list-of-scanners)
  - [Package Management](#package-management)
  - [Node.js Environment](#nodejs-environment)
  - [Frameworks](#frameworks)
  - [Linters](#linters)
  - [Test Frameworks](#test-frameworks)


Total Scanners: 8

# List of scanners

## Package Management

1. **PackageManagerScanner** - Detects which package manager is used in the project (npm, yarn, pnpm).
   - Examples: Various project examples using different package managers

## Node.js Environment

1. **NodeVersionScanner** - Identifies Node.js version specifications in the project.
   
2. **NvmrcScanner** - Extracts Node.js version information from .nvmrc files.

## Frameworks

1. **NextjsScanner** - Analyzes Next.js configuration patterns in projects:
   - App Router vs Pages Router usage
   - React strict mode settings
   - Internationalization configuration
   - Output mode settings

## Linters
1. **XoScanner** - Identifies XO linting configuration patterns including indentation, semicolons, and prettier integration.
   - Examples: `examples/xo-1`, `examples/xo-2`
   
2. **PrettierScanner** - Identifies Prettier configuration in projects.
   - Examples: `examples/prettier`
   
3. **LintingScanner** - Determines which linting tools are used in projects.

## Test Frameworks

1. **TestingFrameworkScanner** - Identifies testing frameworks used in projects.
   - Supported frameworks: jest, mocha, vitest, ava, jasmine, karma, tape, qunit, cypress, playwright, and more 