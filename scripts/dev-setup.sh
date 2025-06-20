#!/bin/bash

# Solara Development Setup Script
echo "🚀 Setting up Solara development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check for required environment variables
echo "🔍 Checking environment variables..."
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating template..."
    cat > .env.local << EOF
# Required Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_URL=http://localhost:3000

# Optional Environment Variables
OPENAI_API_KEY=your_openai_api_key_here
ENCRYPTION_SALT=your_encryption_salt_here
EOF
    echo "📝 Please update .env.local with your actual values"
fi

# Run type check
echo "🔍 Running TypeScript check..."
npx tsc --noEmit --project . || {
    echo "❌ TypeScript check failed"
    exit 1
}

# Run lint
echo "🔍 Running ESLint..."
npm run lint || {
    echo "❌ ESLint check failed"
    exit 1
}

# Test build
echo "🔨 Testing build..."
npm run build || {
    echo "❌ Build failed"
    exit 1
}

echo "✅ Development environment setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Update .env.local with your actual values"
echo "2. Run 'npm run dev' to start development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📋 Available commands:"
echo "  npm run dev     - Start development server"
echo "  npm run build   - Build for production"
echo "  npm run lint    - Run ESLint"
echo "  npm run start   - Start production server" 