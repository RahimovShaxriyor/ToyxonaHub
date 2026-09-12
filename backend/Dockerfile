FROM node:20-alpine

WORKDIR /app

# Install system dependencies for Prisma engine and native builds (bcrypt)
RUN apk add --no-cache python3 make g++ openssl libc6-compat

# Copy package files and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Ensure upload directory exists and grant permissions to node user
RUN mkdir -p uploads && chown -R node:node /app

# Use non-root node user
USER node

EXPOSE 5050

# Run database migrations then start application
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
