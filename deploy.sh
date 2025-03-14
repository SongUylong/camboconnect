#!/bin/bash
set -e

# Production deployment script for CamboConnect

echo "Starting deployment process..."

# Pull latest changes from git
echo "Pulling latest changes from git..."
git pull

# Install dependencies
echo "Installing dependencies..."
npm ci

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application
echo "Building the application..."
npm run build

# Build and start Docker containers
echo "Building and starting Docker containers..."
docker-compose down
docker-compose build app-prod
docker-compose up -d

# Check if the application is running
echo "Checking if the application is running..."
sleep 10
if curl -s http://localhost:3000/api/health | grep -q "status.*ok"; then
  echo "Deployment successful! Application is running at http://158.178.228.121"
else
  echo "Deployment failed! Application is not running."
  docker-compose logs app-prod
  exit 1
fi

echo "Deployment completed successfully!" 