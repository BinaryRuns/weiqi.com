# Supabase Environment Configuration

## Required Environment Variables

Add the following to your `.env` file:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# For backend JWT verification
SUPABASE_JWT_SECRET=your-jwt-secret
```

## Frontend Environment Setup

Update your Next.js environment in `.env`:

```
# Frontend Supabase Config (public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Backend Environment Setup

Add to your Spring Boot `application.properties`:

```properties
# Supabase JWT verification
supabase.jwt.secret=${SUPABASE_JWT_SECRET}
supabase.url=${SUPABASE_URL}
```

## Docker Compose Updates

Update your `docker-compose.yml` to include these environment variables:

```yaml
services:
  frontend:
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      # ...other environment variables
      
  backend:
    environment:
      - SUPABASE_JWT_SECRET=${SUPABASE_JWT_SECRET}
      - SUPABASE_URL=${SUPABASE_URL}
      # ...other environment variables
```

## Environment Security Notes

1. **Never commit real API keys** to version control
2. Keep the `.env` file in `.gitignore`
3. Only use the anon key for client-side code
4. The service role key has admin privileges - only use it in secure environments
5. Store production secrets in a secure vault or CI/CD environment variables

## Environment Variables by Environment

### Development
- Use local .env file

### Testing
- Set environment variables in CI pipeline or testing environment

### Production
- Use secure environment variable storage provided by your hosting platform
- Consider using a secrets manager for production environments

## Accessing Environment Variables

### Frontend (Next.js)
```typescript
// Access in client components
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

### Backend (Spring Boot)
```java
@Value("${supabase.jwt.secret}")
private String jwtSecret;

@Value("${supabase.url}")
private String supabaseUrl;
``` 