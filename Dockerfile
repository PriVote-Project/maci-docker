# Use Node.js base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy your application code
COPY . .

# Copy the entrypoint script
COPY entrypoint.sh /usr/src/app/

# Make the script executable
RUN chmod +x /usr/src/app/entrypoint.sh

# Expose the port for API (if needed)
EXPOSE 3000

# Set the entrypoint to the script
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]