#!/bin/bash

# @solaracosmos Bot Deployment Script
# This script sets up and deploys the Solara flywheel bot

echo "🌞 Setting up @solaracosmos bot for Solara flywheel..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ first."
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Install dependencies
echo "📦 Installing bot dependencies..."
npm install

# Create logs directory
mkdir -p logs

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file..."
    cp .env.production .env
    echo "✅ Environment file created with production settings"
else
    echo "✅ Environment file already exists"
fi

# Test the bot configuration
echo "🧪 Testing bot configuration..."
node -e "
require('dotenv').config();
console.log('Bot FID:', process.env.BOT_FID);
console.log('API Key configured:', process.env.NEYNAR_API_KEY ? '✅' : '❌');
console.log('Signer UUID configured:', process.env.SIGNER_UUID ? '✅' : '❌');
console.log('Solara API:', process.env.SOLARA_API_BASE);
"

echo ""
echo "🚀 Ready to start the bot!"
echo ""
echo "Commands:"
echo "  npm start     - Start bot with PM2"
echo "  npm run logs  - View bot logs"
echo "  npm run status - Check bot status"
echo "  npm run stop  - Stop bot"
echo ""

# Ask if user wants to start immediately
read -p "Start the bot now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting @solaracosmos bot..."
    npm start
    echo ""
    echo "✅ Bot started! Check status with: npm run status"
    echo "📊 View logs with: npm run logs"
fi

echo ""
echo "🎯 @solaracosmos bot is ready to power your Solara flywheel!"