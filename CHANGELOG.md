# psst-ai

## 1.4.0

### Minor Changes

- f9fe73d: [SCANNER] GoVersionScanner - Detects Go version requirements and build constraints from go.mod files and build tags

  Example:

  ```
  ## Go

  - Use Go version 1.21 as specified in go.mod.
  - Go 1.21+ includes enhanced slices package and other performance improvements.
  - Go 1.20+ supports workspace mode and improved fuzzing capabilities.
  - Go 1.18+ supports generics. Consider using them for type-safe code.
  - Go 1.16+ supports embed directive for static files.
  - Use go mod for dependency management instead of GOPATH.
  - Found build constraints: go:build go1.18, go:build linux && amd64. Ensure compatibility across target Go versions.
  - Keep Go version up to date with the latest stable release for security and performance improvements.
  ```

## 1.3.1

### Patch Changes

- bb1b4df: docs
- d0d6add: docs
- de832f1: docs

## 1.3.0

### Minor Changes

- 2725852: TailwindScanner: Analyzes Tailwind CSS configuration and usage patterns including config customization, plugin usage, theme extensions, and dark mode setup
- 137b70c: [SCANNER] ZustandScanner - Add Zustand state management scanner with comprehensive pattern detection for stores, middleware, TypeScript integration, and async operations

## 1.2.0

### Minor Changes

- ee3b3a7: allow to scan nextjs projects
- 6a72b61: Added a new scanner: PrismaScanner - Analyzes Prisma schema and configuration patterns including database providers, relations, enums, indexes, and migration settings
- 0da15fc: add ava scanner
- 18a478b: Added a new scanner: JestScanner - Analyzes Jest configuration patterns in projects including test environment, setup files, transforms, coverage, and module mapping
- 178c5a5: add vue scanner

### Patch Changes

- 376bcfb: docs
- 65a4e1e: docs
- 80d4f74: updated docs

## 1.1.2

### Patch Changes

- f37d262: docs

## 1.1.1

### Patch Changes

- e730413: added editors keywords
- 774ab7c: fix readme
- 34992cd: fix readme
- 6fd921f: docs updated to editors

## 1.1.0

### Minor Changes

- 07f2ae1: added prettier scanner
- ccc45c7: allow to use magic placeholers in rule files

### Patch Changes

- 895793e: fix rules for editors
- ad24fa2: changes rules to be singular instead of plural
- 23ecefe: add -f flag to flat rules without any categories
- 97a33ad: sort categories alphabetically

## 1.0.4

### Patch Changes

- c4ee14e: fix license

## 1.0.3

### Patch Changes

- d2e4fe0: use cli lib instead of manual

## 1.0.2

### Patch Changes

- af794d3: docs

## 1.0.1

### Patch Changes

- d304a45: added keywords to docs

## 1.0.0

### Major Changes

- 3fc8517: bump major

## 0.0.1

### Patch Changes

- e096221: change to console output
- 889a730: bump to major

## 0.0.0

### Major Changes

- f0a0d6b: initial version
