#!/bin/bash

# Portal Page Setup Script
# This script helps you set up and configure your portal page

set -e

echo "🚀 Portal Page Setup"
echo "===================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create config directory if it doesn't exist
if [ ! -d "config" ]; then
    echo "📁 Creating config directory..."
    mkdir -p config
fi

# Copy example config if links.yaml doesn't exist
if [ ! -f "config/links.yaml" ]; then
    echo "📝 Creating default configuration..."
    if [ -f "links-enhanced.yaml" ]; then
        cp links-enhanced.yaml config/links.yaml
    elif [ -f "config/links.yaml.example" ]; then
        cp config/links.yaml.example config/links.yaml
    else
        echo "⚠️  No example configuration found. You'll need to create config/links.yaml manually."
    fi
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "🔧 Creating environment configuration..."
    cp .env.example .env
    echo "✏️  Please edit .env to configure your deployment settings."
fi

# Build and start the container
echo "🔨 Building and starting Enhanced Portal Page..."
docker-compose up -d --build

# Wait a moment for the container to start
sleep 5

# Check if the container is running
if docker ps | grep -q portal-page; then
    echo "✅ Portal Page is running!"
    echo ""
    echo "🌐 Access your portal at: http://localhost"
    echo "📝 Edit config/links.yaml to customize your links"
    echo "🔧 Edit .env to configure deployment settings"
    echo ""
    echo "📚 Useful commands:"
    echo "   docker-compose logs -f        # View logs"
    echo "   docker-compose restart        # Restart service"
    echo "   docker-compose down           # Stop service"
    echo ""
    echo "🎯 Enhanced Features:"
    echo "   • Press Ctrl+K to search through all links"
    echo "   • Press Ctrl+D to toggle dark/light mode"
    echo "   • RSS feeds are cached for better performance"
    echo "   • Mobile-friendly responsive design"
else
    echo "❌ Failed to start Portal Page. Check logs with:"
    echo "   docker-compose -f docker-compose.enhanced.yml logs"
fi

echo ""
echo "🎉 Setup complete! Happy browsing!"