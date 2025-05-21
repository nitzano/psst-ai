Use pnpm as the package manager.
Use xo for linting.
Use the nodejs version specified in the .nvmrc file.
Use async/await for asynchronous operations.
Use named exports for functions and classes.

## Scanners

- New scanners should be added to the `scanners` directory.
- Each scanner should be in its own file.
- Each Scanner can contain to multiple categories, if needed add more enums to Category enums
- Nest similar scanners in a folder
- Scanners should be direct to what they do, and not be too generic
- For every scanner, create example codebase in the `examples` directory