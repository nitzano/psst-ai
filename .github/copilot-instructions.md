## General Guidelines

- Use pnpm as the package manager.
- Run xo to lint the codese with pnpm lint:fix
- Use the nodejs version specified in the .nvmrc file.
- Use async/await for asynchronous operations.
- Use named exports for functions and classes.
- Add tests in a tests directory relative to the file being tested.
- Use PascalCase for enum names and snake_case for enum values.

## Typescript

- Prefer implements over extends
- Place every enum in a separate file.

# AI rule
- AI Rule is a set of rules that AI Code Editor can use to write better code.
- AI Rules are created by Scanners.
- We prefer less rules but more accurate rules.

## Scanners

- A Scanner is a module that detects specific configurations or patterns in a codebase and creates ai rules based on those configurations that AI Code editor can operate better and write better code.
- New scanners should be added to the `scanners` directory.
- Each scanner should be in its own file, if there are multiple files for a scanner, they should be in a folder with the scanner name.
- Each Scanner can create rules to multiple existing categories.
- Each scanner should add a new category for itself. choose simple names as possible.
- When adding a new category, update categoryDisplayTitles in src/utils/category-formatter.ts
- focus on extracting recommendations based on the configuration files related to the scanner directly.
- There should a method in the scanner that returns specific rule or rules.
- If there are 3rd party which can be use to be used to extract information by the scanners, install them with pnpm
- Place similar scanners in a folder
- Update docs/SCANNERS.md
  - with the new scanner information.
  - the number of scanners should be only implemented scanners, not the ones that are coming soon.
- Examples
  - Create an example codebase for the scanner in the `examples` directory (if possible).
  - don't put too much effort in the example codebase, just enough to demonstrate the scanner's functionality.
  - If there is a specific cli builder for the scanner, use it to create the example codebase.
  - test the scanner by running `pnpm dev <examples_folder>` from the root directory.
- After adding a new scanner, run pnpm changeset to add a new minor version change. use the "[SCANNER] " prefix and the scanner name in the changeset title + description.

## Examples

- For every scanner, create example codebase in the `examples` directory
- Examples folder name should start with the scanner name and should be in lowercase
- Each scanner can have more than one example codebase

<!-- PSST-AI-INSTRUCTIONS-START -->

## Linting

- Use xo for linting.

## Node Version

- Use the nodejs version specified in the .nvmrc file (v22.15.1).

## Package Manager

- Use pnpm as the package manager.

## Testing

- Use vitest testing framework.
<!-- PSST-AI-INSTRUCTIONS-END -->
