package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/siddhantgureja/safetrace/models"
	"github.com/siddhantgureja/safetrace/utils"
)

// VaultController handles operations on the vault
type VaultController struct {
	client *mongo.Client
}

// NewVaultController creates a new vault controller
func NewVaultController(client *mongo.Client) *VaultController {
	return &VaultController{
		client: client,
	}
}

// GetVault retrieves the user's vault items
func (c *VaultController) GetVault(ctx *gin.Context) {
	// In a real app, get this from JWT token
	userID := ctx.Query("userId")
	if userID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "userId is required"})
		return
	}

	collection := c.client.Database("safetrace").Collection("vault")
	dbCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(dbCtx, bson.M{"userId": userID})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch vault"})
		return
	}
	defer cursor.Close(dbCtx)

	var vaultItems []models.VaultItem
	if err := cursor.All(dbCtx, &vaultItems); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode vault items"})
		return
	}

	ctx.JSON(http.StatusOK, vaultItems)
}

// CreateVaultItem creates a new vault item
func (c *VaultController) CreateVaultItem(ctx *gin.Context) {
	var vaultItem models.VaultItem
	if err := ctx.ShouldBindJSON(&vaultItem); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate required fields
	if vaultItem.UserID == "" || vaultItem.Title == "" || vaultItem.Type == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "userId, title, and type are required"})
		return
	}

	// Set timestamps
	now := time.Now()
	vaultItem.CreatedAt = now
	vaultItem.UpdatedAt = now

	// Encrypt sensitive data if needed
	if vaultItem.Encrypted {
		for key, value := range vaultItem.Data {
			encrypted, err := utils.Encrypt(value, "")
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt data"})
				return
			}
			vaultItem.Data[key] = encrypted
		}
	}

	collection := c.client.Database("safetrace").Collection("vault")
	dbCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.InsertOne(dbCtx, vaultItem)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create vault item"})
		return
	}

	// Get the ID of the newly inserted document
	id := result.InsertedID.(primitive.ObjectID)
	vaultItem.ID = id

	ctx.JSON(http.StatusCreated, vaultItem)
}

// UpdateVaultItem updates an existing vault item
func (c *VaultController) UpdateVaultItem(ctx *gin.Context) {
	id := ctx.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var vaultItem models.VaultItem
	if err := ctx.ShouldBindJSON(&vaultItem); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set update timestamp
	vaultItem.UpdatedAt = time.Now()

	// Encrypt sensitive data if needed
	if vaultItem.Encrypted {
		for key, value := range vaultItem.Data {
			encrypted, err := utils.Encrypt(value, "")
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt data"})
				return
			}
			vaultItem.Data[key] = encrypted
		}
	}

	collection := c.client.Database("safetrace").Collection("vault")
	dbCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"title":       vaultItem.Title,
			"description": vaultItem.Description,
			"data":        vaultItem.Data,
			"encrypted":   vaultItem.Encrypted,
			"updatedAt":   vaultItem.UpdatedAt,
		},
	}

	result, err := collection.UpdateOne(dbCtx, bson.M{"_id": objID}, update)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update vault item"})
		return
	}

	if result.MatchedCount == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Vault item not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Vault item updated successfully"})
}

// DeleteVaultItem deletes a vault item
func (c *VaultController) DeleteVaultItem(ctx *gin.Context) {
	id := ctx.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	collection := c.client.Database("safetrace").Collection("vault")
	dbCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(dbCtx, bson.M{"_id": objID})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete vault item"})
		return
	}

	if result.DeletedCount == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Vault item not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Vault item deleted successfully"})
} 