# Weiqi.com - Online Go Game Platform

![Go Game](https://img.shields.io/badge/Game-Go-brightgreen)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

Weiqi.com is an online platform for playing the ancient board game **Go** (also known as Weiqi or Baduk). This project aims to provide a seamless and engaging experience for players of all skill levels, from beginners to advanced players. The platform includes features like real-time multiplayer, AI integration, game analysis, and more.

---

## Features

### Core Features
- **Real-Time Multiplayer**: Play Go against other players in real-time.
- **Dynamic Rating System**: Track player skill levels using a dynamic rating system (e.g., Elo or Glicko).
- **Match History**: View detailed records of past games, including moves and outcomes.
- **Game Timer**: Supports various timing systems (e.g., byo-yomi, Fischer) for competitive play.
- **AI Opponent**: Practice against an AI with adjustable difficulty levels.
- **Spectator Mode**: Watch ongoing games in real-time.

### Gameplay Enhancements
- **Custom Game Settings**: Adjust board size, komi, and handicaps.
- **Resign Button**: Allow players to resign gracefully.
- **Draw Offers**: Enable players to offer or accept draws.
- **Game Analysis**: Analyze games with AI-powered tools and heatmaps.

### User Experience
- **Player Profiles**: Display statistics, ratings, and achievements.
- **Leaderboard**: Compete for the top spot on the global or regional leaderboard.
- **Friend System**: Add friends and challenge them directly.
- **Chat System**: Communicate with opponents and spectators during games.

### Technical Features
- **JWT Authentication**: Secure user authentication and WebSocket communication.
- **Reconnection Handling**: Gracefully handle player disconnections and reconnections.
- **Scalable Backend**: Built to handle a large number of concurrent games and users.
- **Cross-Platform Support**: Responsive design for web and mobile devices.

## Technical Architecture

### System Overview

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  Next.js       │◄────►  Spring Boot   │◄────►  PostgreSQL    │
│  Frontend      │  API │  Backend       │     │  Database      │
│                │     │                │     │                │
└────────────────┘     └───────┬────────┘     └────────────────┘
                              │
                      ┌───────▼────────┐
                      │                │
                      │  Redis         │
                      │  (Caching)     │
                      │                │
                      └────────────────┘
```

### Frontend (Next.js)
- TypeScript-based React application
- Responsive UI with Tailwind CSS
- Go board rendering with custom components
- Real-time game updates via WebSockets
- Redux for state management

### Backend (Spring Boot)
- Java-based RESTful API
- WebSocket support for real-time gameplay
- JWT authentication and authorization
- Game logic implementation
- Matchmaking system

### Data Persistence
- PostgreSQL for user data, game records, and settings
- Redis for caching, sessions, and real-time game state

### Communication
- REST API for standard requests
- WebSocket for real-time game events
- JWT for secure authentication

---

## Setup & Installation Guide

This application uses Docker for easy setup and development. Follow these steps to get started.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/downloads)

### Clone the Repository

```bash
git clone https://github.com/yourusername/weiqi.com.git
cd weiqi.com
```

### Environment Setup

This project uses a unified `.env` file to manage environment variables for both frontend and backend:

1. Copy the example environment file to create your local configuration:

```bash
cp .env.example .env
```

2. Edit the `.env` file to customize settings if necessary. The default values are suitable for local development.

3. The environment variables will be automatically loaded by Docker Compose for all services.

4. For local development outside Docker, you can:
   - For Next.js frontend: Use the variables with `NEXT_PUBLIC_` prefix directly
   - For Spring Boot backend: Pass the variables as command-line arguments or use application-local.properties

### Running the Application

Start all services using Docker Compose:

```bash
docker-compose up
```

For detached mode:

```bash
docker-compose up -d
```

### Accessing the Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081
- **Database UI**: http://localhost:8082
  - Email: `admin@admin.com`
  - Password: `admin`

### Database Connection (External Tools)

To connect to the PostgreSQL database from tools like DBeaver, TablePlus, etc:

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `compose-postgres`
- **Username**: `compose-postgres`
- **Password**: `compose-postgres`

### Development Workflow

#### Frontend (Next.js)

The frontend code is located in the `goweb` directory. Changes will automatically be reflected due to the volume mapping.

#### Backend (Spring Boot)

The backend code is in the `goweb-spring` directory. Spring Boot dev tools will automatically reload changes.

#### Stopping the Application

```bash
docker-compose down
```

To remove volumes as well:

```bash
docker-compose down -v
```

### Troubleshooting

- **Port conflicts**: If you have services running on ports 3000, 5432, 6379, or 8081, stop them or modify the port mappings in `docker-compose.yml`
- **Database connection issues**: Ensure PostgreSQL container is running with `docker ps`
- **Frontend not connecting to backend**: Check network settings and CORS configuration

---
