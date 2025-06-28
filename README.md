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

### Environment Variable Encryption with SOPS

This project uses [Mozilla SOPS](https://github.com/mozilla/sops) for encrypting sensitive environment variables:

#### Initial Setup

1. Install SOPS following the [official documentation](https://github.com/mozilla/sops/releases)

2. Set up GPG for encryption:

   ```bash
   # Install GPG if not already installed
   # macOS: brew install gnupg
   # Ubuntu/Debian: sudo apt-get install gnupg
   # Windows: Download from https://www.gnupg.org/download/

   # Generate a new GPG key
   gpg --full-generate-key
   # Select RSA and RSA, 4096 bits, and follow the prompts

   # List your keys to get the fingerprint
   gpg --list-secret-keys --keyid-format=long

   # Export your public key to share with team members
   gpg --armor --export your.email@example.com > your-name-pubkey.asc
   ```

#### Adding a New Team Member (Automated Process)

1. The new team member generates their GPG key and exports their public key as shown above

2. Add the public key to the project's `keys/` directory:

   ```bash
   # From the project root
   cp your-name-pubkey.asc keys/

   # Create a branch for your changes
   git checkout -b add-gpg-key/your-name

   # Add and commit your public key
   git add keys/your-name-pubkey.asc
   git commit -m "Add [Your Name]'s GPG public key"

   # Push the branch and create a pull request
   git push -u origin add-gpg-key/your-name
   # Then create a PR from your branch to main via GitHub interface
   ```

3. After your PR is reviewed and merged, the GitHub Actions workflow (`sops-onboard.yml`) will automatically:

   - Import all public keys from the `keys/` directory
   - Update the `.sops.yaml` configuration with all fingerprints
   - Re-encrypt all `.env.enc` files to include the new key
   - Create a new pull request with these changes

4. After an existing team member approves and merges this second PR:

   ```bash
   # Switch back to main and pull the latest changes
   git checkout main
   git pull

   # Decrypt the environment file
   sops --decrypt .env.enc > .env
   ```

#### Working with Encrypted Files

```bash
# Decrypt an encrypted .env file
sops --decrypt .env.enc > .env

# Edit an encrypted file directly (opens in your default editor)
sops .env.enc

# Re-encrypt after making changes
./scripts/encrypt.sh
```

#### Key Rotation and Management

To rotate your GPG key (recommended annually):

1. Generate a new GPG key as shown in the initial setup

2. Export your new public key and replace your old one:

   ```bash
   # Export your new public key
   gpg --armor --export your.new.email@example.com > your-name-new-pubkey.asc

   # Create a branch for your changes
   git checkout -b rotate-gpg-key/your-name

   # Replace your old key with the new one
   mv your-name-new-pubkey.asc keys/your-name-pubkey.asc

   # Commit and create a PR
   git add keys/your-name-pubkey.asc
   git commit -m "Rotate [Your Name]'s GPG key"
   git push -u origin rotate-gpg-key/your-name
   # Then create a PR from your branch to main via GitHub interface
   ```

3. After your PR is reviewed and merged, the GitHub workflow will automatically update all encrypted files via a second PR.

To remove a team member:

1. Remove their public key from the `keys/` directory:

   ```bash
   # Create a branch for the change
   git checkout -b remove-team-member/former-teammate

   # Remove their key
   git rm keys/former-teammate-pubkey.asc
   git commit -m "Remove [Former Teammate]'s GPG key"
   git push -u origin remove-team-member/former-teammate
   # Then create a PR from your branch to main via GitHub interface
   ```

2. After this PR is merged, the GitHub workflow will automatically re-encrypt all files without their key via a second PR.

#### Best Practices

- **Never commit unencrypted `.env` files** to the repository
- Keep your GPG private key secure and never share it
- Use a strong passphrase for your GPG key
- Rotate your keys periodically (annually recommended)
- Always pull the latest `.env.enc` before making changes

The `.gitignore` file is configured to allow `.env.enc` files while ignoring unencrypted `.env` files.

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
