package controllers

import (
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/siddhantgureja/safetrace/models"
)

// FakeDataController handles operations for generating fake data
type FakeDataController struct{}

// NewFakeDataController creates a new fake data controller
func NewFakeDataController() *FakeDataController {
	// Seed the random number generator
	rand.Seed(time.Now().UnixNano())
	return &FakeDataController{}
}

// GenerateFakeData generates fake data for testing purposes
func (c *FakeDataController) GenerateFakeData(ctx *gin.Context) {
	// In a real implementation, we would use Faker.js on the frontend
	// or a Go equivalent like go-faker
	// For this example, we'll use a simple implementation

	response := models.FakeDataResponse{
		Name:       generateRandomName(),
		Email:      generateRandomEmail(),
		Address:    generateRandomAddress(),
		Phone:      generateRandomPhone(),
		CreditCard: generateRandomCreditCard(),
		Username:   generateRandomUsername(),
		Password:   generateRandomPassword(),
	}

	ctx.JSON(http.StatusOK, response)
}

// Helper functions to generate random data

func generateRandomName() string {
	firstNames := []string{
		"James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
		"William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
		"Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
		"Matthew", "Margaret", "Anthony", "Betty", "Mark", "Sandra", "Donald", "Ashley",
	}

	lastNames := []string{
		"Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson",
		"Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
		"Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee",
		"Walker", "Hall", "Allen", "Young", "Hernandez", "King", "Wright", "Lopez",
	}

	return firstNames[rand.Intn(len(firstNames))] + " " + lastNames[rand.Intn(len(lastNames))]
}

func generateRandomEmail() string {
	domains := []string{"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "example.com"}
	username := strings.ToLower(strings.Replace(generateRandomName(), " ", ".", -1))
	return username + "@" + domains[rand.Intn(len(domains))]
}

func generateRandomAddress() string {
	streetNumbers := []string{"123", "456", "789", "1234", "5678", "9101", "1122", "3344"}
	streets := []string{
		"Main St", "Oak Ave", "Pine Rd", "Maple Ln", "Cedar Blvd", "Washington Ave",
		"Park Pl", "Lake Dr", "River Rd", "Mountain View", "Sunset Blvd", "Valley Way",
	}
	cities := []string{
		"New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
		"San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
	}
	states := []string{"NY", "CA", "IL", "TX", "AZ", "PA", "FL", "OH", "MI", "GA"}
	zipCodes := []string{"10001", "90001", "60601", "77001", "85001", "19101", "78201", "92101"}

	return streetNumbers[rand.Intn(len(streetNumbers))] + " " +
		streets[rand.Intn(len(streets))] + ", " +
		cities[rand.Intn(len(cities))] + ", " +
		states[rand.Intn(len(states))] + " " +
		zipCodes[rand.Intn(len(zipCodes))]
}

func generateRandomPhone() string {
	format := "(###) ###-####"
	result := ""
	for _, char := range format {
		if char == '#' {
			result += string(rune('0' + rand.Intn(10)))
		} else {
			result += string(char)
		}
	}
	return result
}

func generateRandomCreditCard() string {
	prefixes := []string{"4", "5", "37", "34", "6011"}
	prefix := prefixes[rand.Intn(len(prefixes))]
	
	// Generate the remaining digits
	remaining := 16 - len(prefix)
	for i := 0; i < remaining; i++ {
		prefix += string(rune('0' + rand.Intn(10)))
	}
	
	// Format with spaces
	formatted := ""
	for i, char := range prefix {
		if i > 0 && i%4 == 0 {
			formatted += " "
		}
		formatted += string(char)
	}
	
	return formatted
}

func generateRandomUsername() string {
	adjectives := []string{
		"happy", "sunny", "clever", "brave", "mighty", "kind", "swift", "bright",
		"cool", "epic", "awesome", "super", "mega", "ultra", "hyper", "alpha",
	}
	nouns := []string{
		"tiger", "eagle", "ninja", "wizard", "ranger", "warrior", "hunter", "falcon",
		"dragon", "knight", "hero", "champion", "titan", "legend", "master", "chief",
	}
	
	return adjectives[rand.Intn(len(adjectives))] + 
		nouns[rand.Intn(len(nouns))] +
		string(rune('0' + rand.Intn(10))) +
		string(rune('0' + rand.Intn(10)))
}

func generateRandomPassword() string {
	length := 12 + rand.Intn(4) // Password length between 12 and 15
	charset := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+"
	password := make([]byte, length)
	for i := range password {
		password[i] = charset[rand.Intn(len(charset))]
	}
	return string(password)
} 