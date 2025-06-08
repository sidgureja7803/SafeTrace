package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/siddhantgureja/safetrace/models"
)

// BreachCheckController handles operations for checking data breaches
type BreachCheckController struct{}

// NewBreachCheckController creates a new breach check controller
func NewBreachCheckController() *BreachCheckController {
	return &BreachCheckController{}
}

// CheckEmail checks if an email has been involved in a data breach
func (c *BreachCheckController) CheckEmail(ctx *gin.Context) {
	var request models.BreachCheckRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if request.Email == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}

	// Get API key from environment
	apiKey := os.Getenv("XPOSED_API_KEY")
	if apiKey == "" {
		// Use mock data if no API key
		mockResponse := getMockBreachResponse(request.Email)
		ctx.JSON(http.StatusOK, mockResponse)
		return
	}

	// Make request to XposedOrNot API
	client := &http.Client{}
	url := fmt.Sprintf("https://api.xposedornot.com/v1/check-email/%s", request.Email)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}

	req.Header.Add("X-Api-Key", apiKey)
	req.Header.Add("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check breach data"})
		return
	}
	defer resp.Body.Close()

	var apiResponse map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse API response"})
		return
	}

	// Map API response to our model
	// Note: This is a simplified mapping. Adjust based on actual API response
	breachResponse := models.BreachCheckResponse{
		Found:    apiResponse["found"].(bool),
		Count:    int(apiResponse["count"].(float64)),
		Source:   "XposedOrNot",
		Severity: getSeverityLevel(int(apiResponse["count"].(float64))),
	}

	ctx.JSON(http.StatusOK, breachResponse)
}

// CheckPassword checks if a password has been involved in a data breach
func (c *BreachCheckController) CheckPassword(ctx *gin.Context) {
	var request models.BreachCheckRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if request.Password == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Password is required"})
		return
	}

	// Get API key from environment
	apiKey := os.Getenv("XPOSED_API_KEY")
	if apiKey == "" {
		// Use mock data if no API key
		mockResponse := getMockBreachResponse(request.Password)
		ctx.JSON(http.StatusOK, mockResponse)
		return
	}

	// In a real app, this would use the Pwned Passwords API or similar
	// For this example, we'll use a similar mock approach as the email check
	mockResponse := getMockBreachResponse(request.Password)
	ctx.JSON(http.StatusOK, mockResponse)
}

// getMockBreachResponse generates mock data for demonstration purposes
func getMockBreachResponse(input string) models.BreachCheckResponse {
	// Check if the input contains common patterns that might indicate it's at risk
	lowerInput := strings.ToLower(input)
	containsCommonWords := strings.Contains(lowerInput, "password") ||
		strings.Contains(lowerInput, "123456") ||
		strings.Contains(lowerInput, "admin") ||
		strings.Contains(lowerInput, "test")

	// Check email domains for demonstration purposes
	isCommonEmail := strings.HasSuffix(lowerInput, "@gmail.com") ||
		strings.HasSuffix(lowerInput, "@yahoo.com") ||
		strings.HasSuffix(lowerInput, "@hotmail.com")

	// Calculate a "breach count" based on these factors
	var count int
	if containsCommonWords {
		count += 5
	}
	if isCommonEmail {
		count += 3
	}
	if len(input) < 8 {
		count += 4
	}

	// Return a mock response
	return models.BreachCheckResponse{
		Found:    count > 0,
		Count:    count,
		Source:   "Mock Data",
		Severity: getSeverityLevel(count),
	}
}

// getSeverityLevel calculates a severity level based on breach count
func getSeverityLevel(count int) string {
	if count == 0 {
		return "None"
	} else if count < 3 {
		return "Low"
	} else if count < 7 {
		return "Medium"
	} else {
		return "High"
	}
} 