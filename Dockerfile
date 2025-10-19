# Use Node.js LTS version
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Expose the port Cloud Run expects
EXPOSE 8080

# Start the app
CMD ["node", "backend.js"]
