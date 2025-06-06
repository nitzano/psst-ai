


# Scanners Documentation

This document provides an overview of all available scanners in the PSST AI project and their capabilities.

Total Scanners: 15


| Scanner Name | Description | Category | Examples |
|-------------|-------------|----------|----------|
| PackageManagerScanner | Detects which package manager is used in the project (npm, yarn, pnpm) | Package Management | - |
| NodeVersionScanner | Identifies Node.js version specifications in the project | Node.js Environment | - |
| NvmrcScanner | Extracts Node.js version information from .nvmrc files | Node.js Environment | - |
| NextjsScanner | Analyzes Next.js configuration patterns in projects (App Router vs Pages Router usage, React strict mode settings, Internationalization configuration, Output mode settings) | Frameworks | - |
| VueScanner | Detects Vue.js version and configuration patterns (Vue 2.x vs Vue 3.x detection, Vue CLI/Vite/Nuxt.js setup detection, Composition API usage, Vue Router and state management, TypeScript integration) | Frameworks | `examples/vue-1` |
| XoScanner | Identifies XO linting configuration patterns including indentation, semicolons, and prettier integration | Linters | `examples/xo-1`, `examples/xo-2` |
| PrettierScanner | Identifies Prettier configuration in projects | Linters | `examples/prettier` |
| LintingScanner | Determines which linting tools are used in projects | Linters | - |
| TestingFrameworkScanner | Identifies testing frameworks used in projects (jest, mocha, vitest, ava, jasmine, karma, tape, qunit, cypress, playwright, and more) | Test Frameworks | - |
| AvaScanner | Analyzes AVA test runner configuration patterns including file patterns, concurrency, timeout, TypeScript support, and Babel integration | Test Frameworks | `examples/ava-1`, `examples/ava-2` |
| JestScanner | Analyzes Jest configuration patterns in projects including test environment, setup files, transforms, coverage, and module mapping | Test Frameworks | `examples/jest` |
| PrismaScanner | Analyzes Prisma schema and configuration patterns including database providers, relations, enums, indexes, and migration settings | Database | `examples/prisma` |
| TailwindScanner | Analyzes Tailwind CSS configuration and usage patterns including config customization, plugin usage, theme extensions, and dark mode setup | UI Libraries | `examples/tailwind-1`, `examples/tailwind-2` |
| ZustandScanner | Detects Zustand store patterns and configurations (store creation, persistence, middleware) | State Management | `examples/zustand-1`, `examples/zustand-2` |
| GoVersionScanner | Detects Go version requirements and build constraints (go.mod version, build tags) | Go Environment | `examples/go-1` |

# Coming Soon

| Scanner Name | Description | Category |
|-------------|-------------|----------|
| MonorepoScanner | Identifies monorepo structures and tools (Lerna, Nx, pnpm workspaces, Turborepo, Rush) | Package Management |
| NodeRuntimeScanner | Analyzes runtime settings and flags used in Node.js projects (memory limits, environment flags, module resolution) | Node.js Environment |
| TypeScriptConfigScanner | Identifies TypeScript configuration settings (strict mode, target version, module system, path mapping) | Node.js Environment |
| SvelteScanner | Analyzes Svelte configuration and usage patterns (SvelteKit vs vanilla Svelte, adapter configuration, preprocessors) | Frameworks |
| ESLintScanner | Identifies ESLint configuration and rule patterns (extends, plugins, custom rules, parser options) | Linters |
| StylelintScanner | Detects Stylelint configuration for CSS/SCSS (rules, plugins, processors, syntax) | Linters |
| VitestScanner | Detects Vitest configuration and usage patterns (test environment, coverage, mocking, browser mode) | Test Frameworks |
| TestCoverageScanner | Identifies test coverage settings and configurations across different testing frameworks (thresholds, reporters, exclusions) | Test Frameworks |
| WebpackScanner | Analyzes Webpack configuration patterns (entry points, loaders, plugins, optimization settings) | Build Tools |
| ViteScanner | Identifies Vite configuration and build settings (plugins, build targets, dev server, SSR configuration) | Build Tools |
| TurborepoScanner | Identifies Turborepo configuration for monorepos (pipeline configuration, caching strategies, filtering) | Build Tools |
| EsbuildScanner | Detects ESBuild configurations and optimizations (target environments, bundle splitting, plugins) | Build Tools |
| SequelizeScanner | Analyzes Sequelize ORM configuration and model patterns (associations, migrations, seeders, hooks) | Database |
| TypeOrmScanner | Detects TypeORM configuration and entity patterns (decorators, relations, migrations, connection options) | Database |
| DrizzleScanner | Identifies Drizzle ORM usage and schema patterns (schema definition, query patterns, migration setup) | Database |
| DatabaseTypeScanner | Detects database types and connection patterns (PostgreSQL, MySQL, SQLite, MongoDB configurations) | Database |
| DependencySecurityScanner | Identifies security scanning tools for dependencies (npm audit, Snyk, OWASP dependency check) | Security |
| AuthenticationScanner | Detects authentication libraries and patterns (NextAuth, Passport, Auth0, Firebase Auth configurations) | Security |
| A11yScanner | Identifies accessibility scanning tools and configurations (axe-core, Pa11y, Lighthouse accessibility) | Accessibility |
| ComponentA11yScanner | Detects component-level accessibility patterns and issues (ARIA attributes, semantic HTML, keyboard navigation) | Accessibility |
| DockerScanner | Analyzes Docker configuration and container patterns (Dockerfile optimization, multi-stage builds, health checks) | DevOps |
| KubernetesScanner | Detects Kubernetes manifests and deployment configurations (deployments, services, ingress, ConfigMaps) | DevOps |
| GitHubActionsScanner | Identifies GitHub Actions workflow patterns (CI/CD pipelines, matrix strategies, secrets usage) | DevOps |
| JenkinsScanner | Analyzes Jenkins pipeline configurations (Jenkinsfile patterns, plugin usage, build stages) | DevOps |
| EnvironmentScanner | Analyzes environment variable usage and configuration patterns (dotenv files, validation schemas, type safety) | Configuration |
| GraphQLScanner | Detects GraphQL schema and resolver patterns (SDL definitions, code-first vs schema-first, federation) | API |
| RestApiScanner | Identifies REST API patterns and OpenAPI specifications (endpoint structure, validation, documentation) | API |
| ReduxScanner | Analyzes Redux state management patterns (store configuration, middleware, toolkit usage, DevTools) | State Management |
| PiniaScanner | Identifies Pinia store patterns for Vue applications (store definition, composition API usage, plugins) | State Management |
| PythonVersionScanner | Detects Python version requirements and virtual environment configurations (pyproject.toml, requirements.txt, .python-version) | Python Environment |
| PipScanner | Analyzes pip package management patterns (requirements files, constraints, pip configuration) | Python Environment |
| PoetryScanner | Identifies Poetry dependency management configuration (pyproject.toml structure, dependency groups, scripts) | Python Environment |
| FlaskScanner | Detects Flask web framework patterns (app factory, blueprints, configuration, extensions) | Python Frameworks |
| DjangoScanner | Analyzes Django project structure and configuration (settings, models, views, URL patterns, middleware) | Python Frameworks |
| PytestScanner | Identifies pytest testing configuration and patterns (conftest.py, fixtures, markers, plugins) | Python Testing |
| GoModScanner | Analyzes Go module configuration and dependency management (go.mod, go.sum, module versioning) | Go Environment |
| GinScanner | Identifies Gin web framework patterns (routing, middleware, handlers, templates) | Go Frameworks |
| GoTestScanner | Analyzes Go testing patterns (test files, benchmarks, examples, table-driven tests) | Go Testing |
| MaterialUIScanner | Analyzes Material-UI/MUI usage and theming patterns (theme customization, component overrides, styling approaches) | UI Libraries |
| AntDesignScanner | Detects Ant Design configuration and customization patterns (theme variables, component modifications, locale) | UI Libraries |
| ChakraUIScanner | Identifies Chakra UI setup and theming (custom themes, component variants, responsive design patterns) | UI Libraries |
| BootstrapScanner | Detects Bootstrap usage and customization (SCSS variables, component overrides, utility classes) | UI Libraries |
| ReactI18nScanner | Identifies React internationalization patterns (react-i18next configuration, namespace usage, pluralization) | Localization |
| VueI18nScanner | Detects Vue i18n setup and usage patterns (locale files, lazy loading, composition API integration) | Localization |
| NextIntlScanner | Analyzes Next.js internationalization configuration (App Router i18n, locale routing, message formatting) | Localization |
| SentryScanner | Identifies Sentry error monitoring setup and configuration (SDK integration, error boundaries, performance monitoring) | Monitoring |
| DatadogScanner | Detects Datadog monitoring and logging configurations (RUM setup, log forwarding, APM integration) | Monitoring |
| NewRelicScanner | Analyzes New Relic monitoring setup (browser monitoring, APM configuration, custom metrics) | Monitoring | 