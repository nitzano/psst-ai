---
"psst-ai": minor
---

[SCANNER] GoVersionScanner - Detects Go version requirements and build constraints from go.mod files and build tags

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