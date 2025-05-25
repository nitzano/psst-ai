- [List of scanners](#list-of-scanners)
  - [Package Management](#package-management)
  - [Node.js Environment](#nodejs-environment)
  - [Frameworks](#frameworks)
  - [Linters](#linters)
  - [Test Frameworks](#test-frameworks)


Total Scanners: 8

# List of scanners

## Package Management

1. **PackageManagerScanner** - Detects which package manager is used in the project (npm, yarn, pnpm) by checking lock files and package.json configuration.
   - Location: `src/scanners/package-manager-scanner.ts`
   - Examples: Various project examples using different package managers

## Node.js Environment

1. **NodeVersionScanner** - Detects which Node.js version is specified in the project by checking both .nvmrc files and package.json engines.
   - Location: `src/scanners/node-version-scanner.ts`
   
2. **NvmrcScanner** - Specifically checks for .nvmrc file presence and extracts Node.js version information.
   - Location: `src/scanners/nvmrc-scanner.ts`

## Frameworks

1. **NextjsScanner** - Detects if Next.js is used and extracts configuration rules including:
   - App Router vs Pages Router usage
   - React strict mode configuration
   - Internationalization settings
   - Standalone output mode
   - Location: `src/scanners/frameworks/nextjs-scanner.ts`
   - Examples: `examples/nextjs`, `examples/nextjs-app-router`, `examples/nextjs-pages`, `examples/nextjs-pages-router`,
     `examples/next-app-router`, `examples/next-pages-router`

## Linters

1. **XoScanner** - Detects XO linting configuration including indentation settings, semicolon usage, and prettier integration.
   - Location: `src/scanners/linters/xo-scanner.ts`
   - Examples: `examples/xo-1`, `examples/xo-2`
   
2. **PrettierScanner** - Detects Prettier configuration in a project by checking for config files and package.json settings.
   - Location: `src/scanners/prettier-scanner.ts`
   - Examples: `examples/prettier`
   
3. **LintingScanner** - General scanner to detect which linting tool is used in the project.
   - Location: `src/scanners/linters/linting-scanner.ts`

## Test Frameworks

1. **TestingFrameworkScanner** - Detects which testing framework is used in the project by checking configuration files, dependencies, and test scripts.
   - Supported frameworks: jest, mocha, vitest, ava, jasmine, karma, tape, qunit, cypress, playwright, and more
   - Location: `src/scanners/base/testers/testing-framework-scanner.ts` 