# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies separately (better caching)
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create a non-root user to run the application
RUN groupadd -r spring && useradd -r -g spring spring

# Set ownership and permissions
RUN mkdir -p /app/logs && \
    chown -R spring:spring /app

# Copy the JAR from the build stage
COPY --from=build /app/target/*.jar /app/app.jar
RUN chown spring:spring /app/app.jar

# Set the user to run the application
USER spring

# Set JVM options for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Expose the port
EXPOSE 8080

# Run the application
ENTRYPOINT exec java $JAVA_OPTS -jar /app/app.jar