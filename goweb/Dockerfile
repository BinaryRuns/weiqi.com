FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Ensure binaries are executable
RUN chmod +x node_modules/.bin/next

# Expose the application port
EXPOSE 3000

# Explicitly call the local next binary
CMD ["./node_modules/.bin/next", "dev"]
