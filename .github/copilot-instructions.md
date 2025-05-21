## General Guidelines

- Use pnpm as the package manager.
- Run xo to lint the codese with pnpm lint:fix
- Use the nodejs version specified in the .nvmrc file.
- Use async/await for asynchronous operations.
- Use named exports for functions and classes.
- Add tests in a tests directory relative to the file being tested.

## Scanners

- New scanners should be added to the `scanners` directory.
- Each scanner should be in its own file.
- Each Scanner can contain to multiple categories, if needed add more enums to Category enums
- Nest similar scanners in a folder
- Scanners should be direct to what they do, and not be too generic
- If there are 3rd party which can be use to write a scanner, use them

## Examples

- For every scanner, create example codebase in the `examples` directory
- Examples folder name should start with the scanner name and should be in lowercase
- Each scanner can have more than one example codebase
