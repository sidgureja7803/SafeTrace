package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"os"
)

// Encrypt takes a string and encrypts it using AES-256
func Encrypt(plaintext string, userKey string) (string, error) {
	// Use user-specific key if provided, otherwise fall back to server key
	encryptionKey := []byte(userKey)
	if userKey == "" {
		encryptionKey = []byte(os.Getenv("ENCRYPTION_KEY"))
		if len(encryptionKey) == 0 {
			// If no encryption key is set, use a default (not recommended for production)
			encryptionKey = []byte("defaultsecretkey12345678901234567890")
		}
	}

	// Ensure key is exactly 32 bytes (AES-256)
	if len(encryptionKey) != 32 {
		paddedKey := make([]byte, 32)
		copy(paddedKey, encryptionKey)
		encryptionKey = paddedKey
	}

	// Create new AES cipher block
	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}

	// Create a new GCM - Galois Counter Mode
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Create a nonce
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	// Encrypt the data
	ciphertext := aesGCM.Seal(nonce, nonce, []byte(plaintext), nil)

	// Return base64 encoded string
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt takes an encrypted string and decrypts it using AES-256
func Decrypt(encrypted string, userKey string) (string, error) {
	// Use user-specific key if provided, otherwise fall back to server key
	decryptionKey := []byte(userKey)
	if userKey == "" {
		decryptionKey = []byte(os.Getenv("ENCRYPTION_KEY"))
		if len(decryptionKey) == 0 {
			// If no encryption key is set, use a default (not recommended for production)
			decryptionKey = []byte("defaultsecretkey12345678901234567890")
		}
	}

	// Ensure key is exactly 32 bytes (AES-256)
	if len(decryptionKey) != 32 {
		paddedKey := make([]byte, 32)
		copy(paddedKey, decryptionKey)
		decryptionKey = paddedKey
	}

	// Create new AES cipher block
	block, err := aes.NewCipher(decryptionKey)
	if err != nil {
		return "", err
	}

	// Create a new GCM
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Decode the base64 string
	ciphertext, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return "", err
	}

	// Get the nonce size
	nonceSize := aesGCM.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	// Extract the nonce from the ciphertext
	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]

	// Decrypt the data
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

// HashPassword is a simple wrapper for future password hashing
func HashPassword(password string) (string, error) {
	// For now, just encrypt the password
	// In a real app, use bcrypt or similar
	return Encrypt(password, "")
}

// CheckPasswordHash checks if the password matches the hash
func CheckPasswordHash(password, hash string) bool {
	// For now, just decrypt and compare
	// In a real app, use bcrypt or similar
	decrypted, err := Decrypt(hash, "")
	if err != nil {
		return false
	}
	return decrypted == password
} 