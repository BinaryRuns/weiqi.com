# Goweb Spring Backend

This is the Spring Boot backend for the Weiqi.com application.

## Documentation

- [Webhook Configuration](WEBHOOKS.md): Information about configuring and using webhooks

## Environment Variables

The application requires several environment variables to be set:

- `SUPABASE_JWT_SECRET`: JWT secret for Supabase authentication
- `SUPABASE_URL`: URL of the Supabase instance
- `SUPABASE_BEFORE_USER_CREATED_SECRET`: Secret for Supabase webhook verification (see [Webhook Configuration](WEBHOOKS.md) for details)

## Running the Application

### Development

```bash
./mvnw spring-boot:run
```

### Production

```bash
./mvnw clean package
java -jar target/goweb-spring-0.0.1-SNAPSHOT.jar
```

## API Endpoints

The application exposes REST APIs and WebSocket endpoints. See the controller classes for details on available endpoints. 