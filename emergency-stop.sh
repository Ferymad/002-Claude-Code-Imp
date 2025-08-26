#!/bin/bash
# TruthForge Emergency Stop

echo "🆘 TruthForge Emergency Stop Activated"
echo "   Stopping all operations..."

# Kill any running monitors
pkill -f "truthforge" 2>/dev/null || true

# Show available worktrees
if command -v git &> /dev/null && [ -d ".git" ]; then
    echo ""
    echo "📍 Available safety worktrees:"
    git worktree list
    echo ""
    echo "To recover:"
    echo "  cd ../truthforge-safe"
    echo "  git log --oneline -n 5    # Find last good checkpoint"
    echo "  git reset --hard [commit] # Restore to checkpoint"
fi

echo ""
echo "✅ Emergency stop complete"
echo "   Review failure and use rollback procedures"
