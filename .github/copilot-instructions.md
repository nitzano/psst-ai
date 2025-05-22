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

## Scanners

- New scanners should be added to the `scanners` directory.
- Each scanner should be in its own file.
- Each Scanner can create rules to multiple existing categories.
- Each scanner should add a new category for itself. choose simple names as possible.
- When adding a new category, update categoryDisplayTitles in src/utils/category-formmatter.ts
- focus on extracting recommendations based on the configuration file related to the scanner specific things in the codebase
- For every rule or rules find by the scanner, there should be a single method in the class to be used by scan()
- If there are 3rd party which can be use to be used to extract information by the scanners, use them.
- Nest similar scanners in a folder

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
