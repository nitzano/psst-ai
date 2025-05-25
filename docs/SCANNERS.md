- [List of scanners](#list-of-scanners)
  - [Package Management](#package-management)
  - [Node.js Environment](#nodejs-environment)
  - [Frameworks](#frameworks)
  - [Linters](#linters)
  - [Test Frameworks](#test-frameworks)
- [Coming Soon](#coming-soon)
  - [Package Management](#package-management-1)
  - [Node.js Environment](#nodejs-environment-1)
  - [Frameworks](#frameworks-1)
  - [Linters](#linters-1)
  - [Test Frameworks](#test-frameworks-1)
  - [Build Tools](#build-tools)
  - [Database](#database)
  - [Security](#security)
  - [Accessibility](#accessibility)


Total Scanners: 11

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

2. **VueScanner** - Detects Vue.js version and configuration patterns:
   - Vue 2.x vs Vue 3.x detection
   - Vue CLI, Vite, or Nuxt.js setup detection
   - Composition API usage
   - Vue Router and state management (Vuex/Pinia)
   - TypeScript integration
   - Examples: `examples/vue-1`

## Linters
1. **XoScanner** - Identifies XO linting configuration patterns including indentation, semicolons, and prettier integration.
   - Examples: `examples/xo-1`, `examples/xo-2`
   
2. **PrettierScanner** - Identifies Prettier configuration in projects.
   - Examples: `examples/prettier`
   
3. **LintingScanner** - Determines which linting tools are used in projects.

## Test Frameworks

1. **TestingFrameworkScanner** - Identifies testing frameworks used in projects.
   - Supported frameworks: jest, mocha, vitest, ava, jasmine, karma, tape, qunit, cypress, playwright, and more

2. **AvaScanner** - Analyzes AVA test runner configuration patterns including file patterns, concurrency, timeout, TypeScript support, and Babel integration.
   - Examples: `examples/ava-1`, `examples/ava-2`

3. **JestScanner** - Analyzes Jest configuration patterns in projects including test environment, setup files, transforms, coverage, and module mapping.
   - Examples: `examples/jest`

# Coming Soon

## Package Management

   
1. **MonorepoScanner** - Identifies monorepo structures and tools (Lerna, Nx, pnpm workspaces, etc.).
   - Examples: `examples/monorepo`

## Node.js Environment

1. **NodeRuntimeScanner** - Analyzes runtime settings and flags used in Node.js projects.
   - Examples: `examples/node-runtime`
   
2. **TypeScriptConfigScanner** - Identifies TypeScript configuration settings.
   - Examples: `examples/typescript-config`

## Frameworks


1. **SvelteScanner** - Analyzes Svelte configuration and usage patterns.
   - Examples: `examples/svelte`

## Linters

1. **ESLintScanner** - Identifies ESLint configuration and rule patterns.
   - Examples: `examples/eslint`
   
2. **StylelintScanner** - Detects Stylelint configuration for CSS/SCSS.
   - Examples: `examples/stylelint`

## Test Frameworks

1. **VitestScanner** - Detects Vitest configuration and usage patterns.
   - Examples: `examples/vitest`

2. **TestCoverageScanner** - Identifies test coverage settings and configurations across different testing frameworks.

## Build Tools

1. **WebpackScanner** - Analyzes Webpack configuration patterns in projects.
   - Examples: `examples/webpack`

2. **ViteScanner** - Identifies Vite configuration and build settings.
   - Examples: `examples/vite`
   
3. **TurborepoScanner** - Identifies Turborepo configuration for monorepos.
   - Examples: `examples/turborepo`

4. **EsbuildScanner** - Detects ESBuild configurations and optimizations.

## Database

1. **OrmScanner** - Identifies which ORM libraries are used in the project (Prisma, TypeORM, Sequelize, etc.).
   - Examples: `examples/prisma`, `examples/typeorm`

2. **DatabaseTypeScanner** - Detects which database types are targeted in the project.
   - Supported databases: PostgreSQL, MySQL, MongoDB, SQLite, etc.

3. **PrismaScanner** - Analyzes Prisma schema and configuration.
   - Examples: `examples/prisma`

## Security

1. **DependencySecurityScanner** - Identifies security scanning tools used for dependencies.
   - Examples: `examples/dependency-scanner`

2. **AuthenticationScanner** - Detects authentication libraries and patterns used.
   - Supported: Auth.js, NextAuth, Firebase Auth, etc.


## Accessibility

1. **A11yScanner** - Identifies accessibility scanning tools and configurations.
   - Examples: `examples/a11y-tools`
   
2. **ComponentA11yScanner** - Detects component-level accessibility patterns and issues.
   - Examples: `examples/component-a11y` 