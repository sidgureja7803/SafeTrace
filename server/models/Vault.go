package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// VaultItem represents a single item in the user's vault
type VaultItem struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID      string             `bson:"userId" json:"userId"`
	Type        string             `bson:"type" json:"type"` // password, card, note, etc.
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	Encrypted   bool               `bson:"encrypted" json:"encrypted"`
	Data        map[string]string  `bson:"data" json:"data"` // Encrypted data fields
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// PasswordVaultData represents password vault item data
type PasswordVaultData struct {
	Username string `json:"username"`
	Password string `json:"password"`
	URL      string `json:"url"`
	Notes    string `json:"notes"`
}

// CardVaultData represents credit card vault item data
type CardVaultData struct {
	CardholderName string `json:"cardholderName"`
	CardNumber     string `json:"cardNumber"`
	ExpiryMonth    string `json:"expiryMonth"`
	ExpiryYear     string `json:"expiryYear"`
	CVV            string `json:"cvv"`
	Notes          string `json:"notes"`
}

// NoteVaultData represents secure note vault item data
type NoteVaultData struct {
	Content string `json:"content"`
}

// BreachCheckRequest represents a request to check for breaches
type BreachCheckRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// BreachCheckResponse represents a response from the breach check service
type BreachCheckResponse struct {
	Found    bool   `json:"found"`
	Count    int    `json:"count"`
	Source   string `json:"source,omitempty"`
	Severity string `json:"severity,omitempty"`
}

// NewsItem represents a news article
type NewsItem struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	URL         string    `json:"url"`
	ImageURL    string    `json:"imageUrl"`
	Source      string    `json:"source"`
	PublishedAt time.Time `json:"publishedAt"`
}

// RiskAnalysisRequest represents a request for risk analysis
type RiskAnalysisRequest struct {
	Email            string   `json:"email"`
	HasStrongPasswords bool     `json:"hasStrongPasswords"`
	Uses2FA           bool     `json:"uses2FA"`
	UsesSocialMedia   bool     `json:"usesSocialMedia"`
	PublicProfiles    []string `json:"publicProfiles"`
	HasDataBreaches   bool     `json:"hasDataBreaches"`
	SharesPersonalInfo bool    `json:"sharesPersonalInfo"`
}

// RiskAnalysisResponse represents a response from the risk analysis service
type RiskAnalysisResponse struct {
	Score      int      `json:"score"`
	RiskLevel  string   `json:"riskLevel"` // Low, Medium, High
	Factors    []string `json:"factors"`
	Advice     []string `json:"advice"`
}

// FakeDataResponse represents generated fake data
type FakeDataResponse struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Address    string `json:"address"`
	Phone      string `json:"phone"`
	CreditCard string `json:"creditCard"`
	Username   string `json:"username"`
	Password   string `json:"password"`
} 