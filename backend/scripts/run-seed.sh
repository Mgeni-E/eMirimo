#!/bin/bash

echo "Starting database seeding process..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "MongoDB is not running. Please start MongoDB first."
    echo "You can start MongoDB with: brew services start mongodb-community"
    exit 1
fi

# Build the project first
echo "Building the project..."
npm run build

# Run the seeding script
echo "Running database seeding..."
npm run seed

echo "Database seeding completed!"
echo "You can now test the admin dashboard with sample data."
