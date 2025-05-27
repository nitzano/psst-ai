//go:build go1.18

package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Generic function demonstrating Go 1.18+ features
func min[T ~int | ~float64](a, b T) T {
	if a < b {
		return a
	}
	return b
}

func main() {
	r := gin.Default()
	
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
			"min":     min(5, 10),
		})
	})
	
	fmt.Println("Server starting on :8080")
	r.Run(":8080")
}
