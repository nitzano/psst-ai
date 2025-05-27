# Go Version Scanner Example

This is an example Go project that demonstrates various Go version requirements and build constraints that the GoVersionScanner can detect.

## Features Demonstrated

1. **Go Version in go.mod**: Uses Go 1.21 as specified in go.mod
2. **Build Constraints**: Uses both old-style and new-style build constraints
3. **Modern Go Features**: Demonstrates generics (Go 1.18+)
4. **Platform-specific Code**: Shows build tags for specific platforms

## Files

- `go.mod`: Specifies Go 1.21 requirement
- `main.go`: Uses Go 1.18+ generics with build constraint
- `platform/platform_linux.go`: Platform-specific code with build tags

## Scanner Detection

The GoVersionScanner will detect:
- Go version 1.21 from go.mod
- Build constraints: `go:build go1.18` and `go:build linux && amd64`
- Recommendations for Go 1.21+ features and best practices

## Running

```bash
go run main.go
```

Then visit http://localhost:8080/ping to see the API response.
