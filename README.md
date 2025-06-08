# SafeTrace - Privacy & Security Monitoring Tool

A full-stack web application that helps users monitor and protect their digital privacy.

## Features

- **Privacy Breach Checking**: Check if your data has been exposed in known breaches
- **Encrypted Vault**: Securely store sensitive information
- **Fake Data Generation**: Generate fake data for testing
- **Privacy Risk Analysis**: Get insights on your privacy risk level
- **News Feed**: Stay updated with privacy and security news

## Tech Stack

- **Frontend**: React.js with GSAP animations
- **Backend**: Golang
- **Authentication**: Firebase (Google & GitHub)
- **Database**: MongoDB for encrypted storage
- **APIs**: XposedOrNot, NewsAPI, Mail.tm, ImageKit

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- Go (v1.16+)
- MongoDB
- Firebase account

### Frontend Setup
```bash
cd client
npm install
npm start
```

### Backend Setup
```bash
cd server
go mod download
go run main.go
```

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```
# Firebase
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

# MongoDB
MONGO_URI=

# API Keys
XPOSED_API_KEY=
NEWS_API_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```

## License
MIT 