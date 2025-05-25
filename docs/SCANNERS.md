- [List of scanners](#list-of-scanners)
  - [Package Management](#package-management)
  - [Node.js Environment](#nodejs-environment)
  - [Frameworks](#frameworks)
  - [Linters](#linters)
  - [Test Frameworks](#test-frameworks)
  - [Database](#database)
- [Coming Soon](#coming-soon)


Total Scanners: 12

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

## Database

1. **PrismaScanner** - Analyzes Prisma schema and configuration patterns including database providers, relations, enums, indexes, and migration settings.
   - Examples: `examples/prisma`

# Coming Soon

| Scanner Name | Description | Category |
|-------------|-------------|----------|
| MonorepoScanner | Identifies monorepo structures and tools (Lerna, Nx, pnpm workspaces, etc.) | Package Management |
| NodeRuntimeScanner | Analyzes runtime settings and flags used in Node.js projects | Node.js Environment |
| TypeScriptConfigScanner | Identifies TypeScript configuration settings | Node.js Environment |
| SvelteScanner | Analyzes Svelte configuration and usage patterns | Frameworks |
| ESLintScanner | Identifies ESLint configuration and rule patterns | Linters |
| StylelintScanner | Detects Stylelint configuration for CSS/SCSS | Linters |
| VitestScanner | Detects Vitest configuration and usage patterns | Test Frameworks |
| TestCoverageScanner | Identifies test coverage settings and configurations across different testing frameworks | Test Frameworks |
| WebpackScanner | Analyzes Webpack configuration patterns in projects | Build Tools |
| ViteScanner | Identifies Vite configuration and build settings | Build Tools |
| TurborepoScanner | Identifies Turborepo configuration for monorepos | Build Tools |
| EsbuildScanner | Detects ESBuild configurations and optimizations | Build Tools |
| OrmScanner | Identifies which ORM libraries are used in the project (Prisma, TypeORM, Sequelize, etc.) | Database |
| DatabaseTypeScanner | Detects which database types are targeted in the project | Database |
| DependencySecurityScanner | Identifies security scanning tools used for dependencies | Security |
| AuthenticationScanner | Detects authentication libraries and patterns used | Security |
| A11yScanner | Identifies accessibility scanning tools and configurations | Accessibility |
| ComponentA11yScanner | Detects component-level accessibility patterns and issues | Accessibility |
| DockerScanner | Analyzes Docker configuration and container patterns | DevOps |
| KubernetesScanner | Detects Kubernetes manifests and deployment configurations | DevOps |
| CIScanner | Identifies CI/CD pipeline configurations (GitHub Actions, Jenkins, etc.) | DevOps |
| EnvironmentScanner | Analyzes environment variable usage and configuration patterns | Configuration |
| GraphQLScanner | Detects GraphQL schema and resolver patterns | API |
| RestApiScanner | Identifies REST API patterns and OpenAPI specifications | API |
| StateManagementScanner | Analyzes state management libraries (Redux, Zustand, Pinia, etc.) | Frameworks |
| UILibraryScanner | Detects UI component libraries (Material-UI, Ant Design, Chakra UI, etc.) | UI/UX |
| LocalizationScanner | Identifies internationalization and localization patterns | Configuration |
| PerformanceScanner | Analyzes performance monitoring and optimization tools | Monitoring | 