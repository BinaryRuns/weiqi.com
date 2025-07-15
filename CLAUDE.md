# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Weiqi.com is a full-stack online Go (Weiqi/Baduk) gaming platform with real-time multiplayer capabilities. The architecture consists of:

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Spring Boot 3.2.4 with Java 21, REST API + WebSocket support
- **Database**: PostgreSQL with JPA/Hibernate
- **Cache**: Redis for session management and real-time game state
- **Auth**: Supabase with JWT tokens
- **Deployment**: AWS EC2 (backend) + Vercel (frontend)

## Quick Start Commands

### Development Environment
```bash
# Start all services with Docker Compose
docker-compose up

# Or detached mode
docker-compose up -d

# Decrypt environment variables (requires GPG key)
./scripts/decrypt.sh

# Access services:
# Frontend: http://localhost:3000
# Backend: http://localhost:8081
# Database UI: http://localhost:8082 (admin@admin.com/admin)
```

### Frontend (Next.js)
```bash
cd goweb
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check
npm start            # Production server
```

### Backend (Spring Boot)
```bash
cd goweb-spring
./mvnw spring-boot:run    # Development server
./mvnw test              # Run tests
./mvnw clean package     # Build JAR
java -jar target/goweb-spring-0.0.1-SNAPSHOT.jar  # Run JAR
```

## Key Architecture Patterns

### Backend Structure
```
controllers/     # REST endpoints and WebSocket handlers
services/        # Business logic and game rules
repositories/    # Database access layer
entities/        # JPA entities
config/          # Security, Redis, WebSocket configs
aspects/         # Authentication and logging aspects
```

### Frontend Structure
```
src/
├── app/          # Next.js app router pages
├── components/   # Reusable UI components (shadcn/ui)
├── contexts/     # React contexts (WebSocket, Auth)
├── hooks/        # Custom React hooks
├── lib/          # Utilities and API clients
└── store/        # Redux store and slices
```

### Authentication Flow
- JWT tokens managed by Supabase
- `@RequiresAuthentication` annotation for protected endpoints
- `SupabaseAuthProvider` for frontend auth state
- WebSocket connections use JWT for authentication

### Game Logic
- Real-time game state via WebSocket (STOMP protocol)
- Board representation: 2D arrays with consistent indexing
- Move validation, capture detection, scoring algorithms
- Time control systems (main time, byo-yomi)

## Development Workflow

### Environment Management
- Use SOPS for encrypted environment variables
- `.env.enc` files are committed, `.env.dec` files are gitignored
- Team key management via `keys/` directory and automated GitHub Actions

### Code Standards
- **Backend**: RESTful API design, constructor injection, MapStruct for DTOs
- **Frontend**: shadcn/ui components, Tailwind CSS, TypeScript strict mode
- **Both**: Consistent error handling, proper logging, input validation

### Database
- PostgreSQL with Flyway migrations (production)
- JPA entities with proper relationships
- Redis for caching and session storage

### Testing
- **Backend**: JUnit 5 tests in `src/test/java`
- **Frontend**: Component tests (setup needed)
- **Integration**: WebSocket testing via browser dev tools

## Common Development Tasks

### Adding New API Endpoint
1. Create controller method in appropriate controller
2. Add DTOs in `dto/` package
3. Implement service logic in `services/`
4. Add entity/repository if needed
5. Test with frontend integration

### Adding New Component
1. Use shadcn/ui CLI: `npx shadcn@latest add component-name`
2. Follow existing patterns in `src/components/`
3. Add TypeScript interfaces in appropriate types file
4. Test responsiveness across devices

### Environment Variable Changes
1. Edit `.env.enc` with: `sops .env.enc`
2. Re-encrypt for team: `./scripts/encrypt.sh`
3. Commit `.env.enc` changes
4. GitHub Actions will auto-update for all team members

## Deployment
- **Backend**: GitHub Actions deploy to AWS EC2 via `deploy.yml`
- **Frontend**: GitHub Actions deploy to Vercel via `frontend-deploy.yml`
- **Infrastructure**: Terraform configurations in `terraform/`

## Troubleshooting
- **Port conflicts**: Check `docker-compose.yml` port mappings
- **SOPS issues**: See README.md for WSL GPG configuration
- **Database connection**: Verify PostgreSQL container is running
- **WebSocket issues**: Check browser Network tab for WS connections