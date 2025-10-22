#!/bin/bash

echo "🚀 Setting up MaxERP Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Redis is running
if ! redis-cli ping &> /dev/null; then
    echo "⚠️  Redis is not running. Please start Redis server first."
    echo "   You can start Redis with: docker run -d -p 6379:6379 redis:alpine"
    echo "   Or install Redis locally and start the service."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
PORT=4001
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_SECRET=REDACTED_JWT_SECRET
NODE_ENV=development
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Seed the database
echo "🌱 Seeding database..."
npm run seed

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run start:dev"
echo ""
echo "📚 API Documentation:"
echo "   http://localhost:4001"
echo ""
echo "🔐 Test Credentials:"
echo "   Employee: john.doe@company.com / password123"
echo "   Manager: mike.johnson@company.com / password123"
