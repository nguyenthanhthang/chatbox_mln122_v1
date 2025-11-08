#!/bin/bash

# Script to setup .env file from env.example
# Usage: ./setup-env.sh

echo "🔧 Setting up .env file for local development..."

if [ -f ".env" ]; then
    echo "⚠️  File .env already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled. Keeping existing .env file."
        exit 0
    fi
fi

if [ ! -f "env.example" ]; then
    echo "❌ Error: env.example not found!"
    exit 1
fi

# Copy env.example to .env
cp env.example .env

echo "✅ Created .env file from env.example"
echo ""
echo "📝 Next steps:"
echo "   1. Open backend/.env"
echo "   2. Replace 'your-google-ai-api-key-here' with your actual API key"
echo "   3. Update other credentials if needed (MongoDB, Cloudinary, etc.)"
echo ""
echo "⚠️  IMPORTANT: Never commit .env file to Git!"
echo ""

