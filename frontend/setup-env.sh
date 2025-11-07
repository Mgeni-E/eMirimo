#!/bin/bash

# Setup script for Cloudinary environment variables
# This script helps you create the .env file from the template

echo "🔧 Setting up Cloudinary environment variables..."
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Your existing .env file was not modified."
        exit 1
    fi
fi

# Copy template to .env
if [ -f "env.template" ]; then
    cp env.template .env
    echo "✅ Created .env file from template"
    echo ""
    echo "📝 Please edit .env and fill in your Cloudinary credentials:"
    echo "   1. Replace 'your-cloud-name' with your actual Cloudinary cloud name"
    echo "   2. Verify preset names match your Cloudinary presets:"
    echo "      - emirimo-profiles (for images)"
    echo "      - emirimo-documents (for PDFs)"
    echo ""
    echo "💡 Your Cloud Name can be found in Cloudinary Dashboard"
    echo "💡 Make sure your presets are configured correctly:"
    echo "   - Image preset: Resource Type = Image/Auto"
    echo "   - Document preset: Resource Type = Raw (CRITICAL!)"
    echo ""
else
    echo "❌ Error: env.template file not found!"
    exit 1
fi

