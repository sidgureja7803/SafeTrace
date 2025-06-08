package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/siddhantgureja/safetrace/controllers"
)

var client *mongo.Client

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file")
	}

	// Set up MongoDB connection
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// Ping the MongoDB server to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Connected to MongoDB!")

	// Initialize router
	router := gin.Default()

	// Set up CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Initialize controllers
	fakeDataController := controllers.NewFakeDataController()
	breachCheckController := controllers.NewBreachCheckController()
	vaultController := controllers.NewVaultController(client)
	newsController := controllers.NewNewsController()
	riskController := controllers.NewRiskController()

	// Health check endpoint
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// API routes
	api := router.Group("/api")
	{
		// Fake data routes
		fakeData := api.Group("/fake-data")
		{
			fakeData.GET("/generate", fakeDataController.GenerateFakeData)
		}

		// Breach check routes
		breachCheck := api.Group("/breach-check")
		{
			breachCheck.POST("/email", breachCheckController.CheckEmail)
			breachCheck.POST("/password", breachCheckController.CheckPassword)
		}

		// Vault routes
		vault := api.Group("/vault")
		{
			vault.GET("/", vaultController.GetVault)
			vault.POST("/", vaultController.CreateVaultItem)
			vault.PUT("/:id", vaultController.UpdateVaultItem)
			vault.DELETE("/:id", vaultController.DeleteVaultItem)
		}

		// News routes
		news := api.Group("/news")
		{
			news.GET("/", newsController.GetNews)
		}

		// Risk analysis routes
		risk := api.Group("/risk")
		{
			risk.POST("/analyze", riskController.AnalyzeRisk)
		}
	}

	// Set port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Server running on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
} 