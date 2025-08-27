#!/bin/bash
# Pre-commit validation hook

echo "🔍 TruthForge pre-commit validation..."

# Check if validation passed
if [ ! -f ".truthforge/validation-passed" ]; then
    echo "❌ Cannot commit: Run /validate first"
    exit 1
fi

# Run tests (no mocks allowed)
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    echo "🧪 Running tests..."
    npm test --no-mock || {
        echo "❌ Tests failed"
        exit 1
    }
fi

echo "✅ Pre-commit validation passed"
rm -f .truthforge/validation-passed  # Consume the validation token
