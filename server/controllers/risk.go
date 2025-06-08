package controllers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/siddhantgureja/safetrace/models"
)

// RiskController handles operations for privacy risk analysis
type RiskController struct{}

// NewRiskController creates a new risk controller
func NewRiskController() *RiskController {
	return &RiskController{}
}

// AnalyzeRisk analyzes a user's privacy risk level
func (c *RiskController) AnalyzeRisk(ctx *gin.Context) {
	var request models.RiskAnalysisRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Calculate risk score based on provided factors
	score := calculateRiskScore(request)
	riskLevel := getRiskLevel(score)
	factors := getRiskFactors(request)
	advice := getAdvice(request, factors)

	response := models.RiskAnalysisResponse{
		Score:     score,
		RiskLevel: riskLevel,
		Factors:   factors,
		Advice:    advice,
	}

	ctx.JSON(http.StatusOK, response)
}

// calculateRiskScore calculates a risk score based on provided factors
func calculateRiskScore(request models.RiskAnalysisRequest) int {
	score := 50 // Base score

	// Adjust based on password strength
	if request.HasStrongPasswords {
		score -= 15
	} else {
		score += 15
	}

	// Adjust based on 2FA usage
	if request.Uses2FA {
		score -= 20
	} else {
		score += 10
	}

	// Adjust based on social media presence
	if request.UsesSocialMedia {
		score += 5
		score += len(request.PublicProfiles) * 2
	}

	// Adjust based on data breaches
	if request.HasDataBreaches {
		score += 25
	}

	// Adjust based on personal info sharing
	if request.SharesPersonalInfo {
		score += 15
	}

	// Cap score between 0 and 100
	if score < 0 {
		score = 0
	} else if score > 100 {
		score = 100
	}

	return score
}

// getRiskLevel determines the risk level based on the score
func getRiskLevel(score int) string {
	if score < 30 {
		return "Low"
	} else if score < 70 {
		return "Medium"
	} else {
		return "High"
	}
}

// getRiskFactors identifies specific risk factors
func getRiskFactors(request models.RiskAnalysisRequest) []string {
	var factors []string

	if !request.HasStrongPasswords {
		factors = append(factors, "Weak password usage")
	}

	if !request.Uses2FA {
		factors = append(factors, "No two-factor authentication")
	}

	if request.UsesSocialMedia && len(request.PublicProfiles) > 2 {
		factors = append(factors, "High social media presence")
	}

	if request.HasDataBreaches {
		factors = append(factors, "Involved in previous data breaches")
	}

	if request.SharesPersonalInfo {
		factors = append(factors, "Shares sensitive personal information online")
	}

	// Email domain risk factor
	if strings.HasSuffix(request.Email, "@gmail.com") ||
		strings.HasSuffix(request.Email, "@yahoo.com") ||
		strings.HasSuffix(request.Email, "@hotmail.com") {
		factors = append(factors, "Using common email provider")
	}

	return factors
}

// getAdvice provides personalized advice based on risk factors
func getAdvice(request models.RiskAnalysisRequest, factors []string) []string {
	var advice []string

	// Password advice
	if !request.HasStrongPasswords {
		advice = append(advice, "Use stronger, unique passwords for each account. Consider a password manager.")
	}

	// 2FA advice
	if !request.Uses2FA {
		advice = append(advice, "Enable two-factor authentication on all accounts that support it.")
	}

	// Social media advice
	if request.UsesSocialMedia {
		if len(request.PublicProfiles) > 0 {
			advice = append(advice, "Review privacy settings on your social media accounts. Consider making profiles private.")
		}
		advice = append(advice, "Be cautious about the information you share on social media.")
	}

	// Data breach advice
	if request.HasDataBreaches {
		advice = append(advice, "Change passwords for all affected accounts and monitor for suspicious activity.")
	}

	// Personal info advice
	if request.SharesPersonalInfo {
		advice = append(advice, "Limit the personal information you share online, especially on public forums.")
	}

	// General advice
	advice = append(advice, "Regularly check for data breaches involving your accounts.")
	advice = append(advice, "Use a VPN when connecting to public WiFi networks.")

	return advice
} 