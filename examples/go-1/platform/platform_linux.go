//go:build linux && amd64

package platform

import "runtime"

// GetPlatform returns the current platform information
func GetPlatform() string {
	return runtime.GOOS + "/" + runtime.GOARCH
}
