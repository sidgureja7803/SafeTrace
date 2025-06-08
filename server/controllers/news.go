package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/siddhantgureja/safetrace/models"
)

// NewsController handles operations for retrieving security news
type NewsController struct{}

// NewNewsController creates a new news controller
func NewNewsController() *NewsController {
	return &NewsController{}
}

// GetNews retrieves the latest security and privacy news
func (c *NewsController) GetNews(ctx *gin.Context) {
	// Get API key from environment
	apiKey := os.Getenv("NEWS_API_KEY")
	if apiKey == "" {
		// Use mock data if no API key
		mockNews := getMockNews()
		ctx.JSON(http.StatusOK, mockNews)
		return
	}

	// Construct the NewsAPI URL
	url := fmt.Sprintf("https://newsapi.org/v2/everything?q=cybersecurity%%20OR%%20privacy%%20OR%%20data%%20breach&sortBy=publishedAt&apiKey=%s&pageSize=10", apiKey)

	// Make request to NewsAPI
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch news"})
		return
	}
	defer resp.Body.Close()

	// Parse the response
	var apiResponse struct {
		Status      string `json:"status"`
		TotalResults int    `json:"totalResults"`
		Articles    []struct {
			Source      struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			} `json:"source"`
			Author      string    `json:"author"`
			Title       string    `json:"title"`
			Description string    `json:"description"`
			URL         string    `json:"url"`
			URLToImage  string    `json:"urlToImage"`
			PublishedAt time.Time `json:"publishedAt"`
			Content     string    `json:"content"`
		} `json:"articles"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse API response"})
		return
	}

	// Map API response to our model
	var newsItems []models.NewsItem
	for _, article := range apiResponse.Articles {
		newsItem := models.NewsItem{
			Title:       article.Title,
			Description: article.Description,
			URL:         article.URL,
			ImageURL:    article.URLToImage,
			Source:      article.Source.Name,
			PublishedAt: article.PublishedAt,
		}
		newsItems = append(newsItems, newsItem)
	}

	ctx.JSON(http.StatusOK, newsItems)
}

// getMockNews generates mock news data for demonstration purposes
func getMockNews() []models.NewsItem {
	return []models.NewsItem{
		{
			Title:       "Major Data Breach Affects Millions of Users",
			Description: "A leading tech company has disclosed a data breach that exposed personal information of millions of users, including emails and hashed passwords.",
			URL:         "https://example.com/news/1",
			ImageURL:    "https://example.com/images/news1.jpg",
			Source:      "Tech Security News",
			PublishedAt: time.Now().AddDate(0, 0, -1),
		},
		{
			Title:       "New Privacy Regulations Coming into Effect Next Month",
			Description: "Governments around the world are implementing stricter privacy regulations, giving users more control over their personal data.",
			URL:         "https://example.com/news/2",
			ImageURL:    "https://example.com/images/news2.jpg",
			Source:      "Privacy Today",
			PublishedAt: time.Now().AddDate(0, 0, -2),
		},
		{
			Title:       "5 Ways to Improve Your Online Privacy",
			Description: "Security experts share their top tips for protecting your online privacy in an increasingly connected world.",
			URL:         "https://example.com/news/3",
			ImageURL:    "https://example.com/images/news3.jpg",
			Source:      "Digital Life",
			PublishedAt: time.Now().AddDate(0, 0, -3),
		},
		{
			Title:       "Ransomware Attacks on the Rise: What You Need to Know",
			Description: "Ransomware attacks have increased by 300% in the past year. Learn how to protect yourself and your organization.",
			URL:         "https://example.com/news/4",
			ImageURL:    "https://example.com/images/news4.jpg",
			Source:      "Cyber Defense Mag",
			PublishedAt: time.Now().AddDate(0, 0, -4),
		},
		{
			Title:       "The Dark Side of Smart Devices: Privacy Concerns",
			Description: "As smart devices become more prevalent in our homes, privacy experts warn about the potential risks to our personal data.",
			URL:         "https://example.com/news/5",
			ImageURL:    "https://example.com/images/news5.jpg",
			Source:      "IoT World",
			PublishedAt: time.Now().AddDate(0, 0, -5),
		},
	}
} 