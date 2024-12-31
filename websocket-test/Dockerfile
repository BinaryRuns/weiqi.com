# Use Node.js base image
FROM node:alpine

# Install http-server
RUN npm install -g http-server

# Copy the HTML file
COPY socketTest.html /app/socketTest.html

# Set the working directory
WORKDIR /app

# Expose port 8080
EXPOSE 8083

# Run the server
CMD ["http-server", "-p", "8083"]
