#!/bin/bash

# TruthForge Checkpoint System
# Creates validated checkpoints only after proof requirements are met

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[CHECKPOINT]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [checkpoint_name] [validation_proof_description]"
    echo ""
    echo "Creates a TruthForge checkpoint only if validation has passed."
    echo ""
    echo "Arguments:"
    echo "  checkpoint_name           Name for this checkpoint (required)"
    echo "  validation_proof_description   Description of validation proof (optional)"
    echo ""
    echo "Examples:"
    echo "  $0 \"user-auth-complete\" \"All authentication tests passing with screenshots\""
    echo "  $0 \"api-endpoints-working\" \"Load test with 50 users completed successfully\""
    echo ""
    echo "The system will:"
    echo "  1. Check if validation token exists (.truthforge/validation-passed)"
    echo "  2. Verify git working directory is clean"
    echo "  3. Create git worktree backup (if configured)"
    echo "  4. Create the checkpoint commit"
    echo "  5. Update checkpoint history"
}

# Check arguments
if [ $# -lt 1 ]; then
    print_error "Checkpoint name is required"
    show_usage
    exit 1
fi

CHECKPOINT_NAME="$1"
VALIDATION_PROOF="${2:-"Validation proof not provided"}"

print_status "TruthForge Checkpoint System Starting..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a Git repository"
    exit 1
fi

# Check for validation token
if [ ! -f ".truthforge/validation-passed" ]; then
    print_error "Validation token not found!"
    print_error "Cannot create checkpoint without validation proof."
    print_error "Run '/validate' command first to generate validation evidence."
    exit 1
fi

print_success "Validation token found ✓"

# Read validation data
VALIDATION_DATA=$(cat .truthforge/validation-passed)
VALIDATION_TIMESTAMP=$(echo "$VALIDATION_DATA" | grep -o '"timestamp":"[^"]*"' | cut -d'"' -f4)

print_status "Validation completed at: $VALIDATION_TIMESTAMP"

# Check if working directory is clean
if ! git diff-index --quiet HEAD --; then
    print_warning "Working directory has uncommitted changes"
    echo ""
    git status --short
    echo ""
    read -p "Continue with checkpoint creation? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Checkpoint cancelled"
        exit 0
    fi
fi

# Create .truthforge directory if it doesn't exist
mkdir -p .truthforge

# Create safety worktree if it doesn't exist
SAFETY_WORKTREE="../truthforge-safe"
if [ ! -d "$SAFETY_WORKTREE" ]; then
    print_status "Creating safety worktree..."
    if git worktree add "$SAFETY_WORKTREE" HEAD 2>/dev/null; then
        print_success "Safety worktree created at $SAFETY_WORKTREE"
    else
        print_warning "Could not create safety worktree (may already exist)"
    fi
else
    print_status "Safety worktree exists at $SAFETY_WORKTREE"
    
    # Update safety worktree
    cd "$SAFETY_WORKTREE"
    git fetch origin 2>/dev/null || true
    git reset --hard HEAD
    cd - > /dev/null
    print_status "Safety worktree updated"
fi

# Stage any changes
print_status "Staging changes..."
git add .

# Create checkpoint commit
COMMIT_MESSAGE="CHECKPOINT: $CHECKPOINT_NAME

Validation Evidence: $VALIDATION_PROOF
Validation Time: $VALIDATION_TIMESTAMP
Checkpoint Time: $(date -Iseconds)

This checkpoint was created by TruthForge after successful validation.
The validation token confirms all proof requirements were met.

🔥 Generated with TruthForge Framework"

print_status "Creating checkpoint commit..."

if git commit -m "$COMMIT_MESSAGE"; then
    COMMIT_HASH=$(git rev-parse HEAD)
    print_success "Checkpoint created: $COMMIT_HASH"
    
    # Update checkpoint history
    CHECKPOINT_HISTORY=".truthforge/checkpoints.json"
    
    # Initialize checkpoint history if it doesn't exist
    if [ ! -f "$CHECKPOINT_HISTORY" ]; then
        echo '{"checkpoints": []}' > "$CHECKPOINT_HISTORY"
    fi
    
    # Add checkpoint to history
    CHECKPOINT_ENTRY=$(cat <<EOF
{
  "name": "$CHECKPOINT_NAME",
  "commit": "$COMMIT_HASH",
  "timestamp": "$(date -Iseconds)",
  "validation_proof": "$VALIDATION_PROOF",
  "validation_timestamp": "$VALIDATION_TIMESTAMP"
}
EOF
)
    
    # Use jq if available, otherwise use simple sed
    if command -v jq >/dev/null 2>&1; then
        jq ".checkpoints += [$CHECKPOINT_ENTRY]" "$CHECKPOINT_HISTORY" > "$CHECKPOINT_HISTORY.tmp"
        mv "$CHECKPOINT_HISTORY.tmp" "$CHECKPOINT_HISTORY"
    else
        # Simple sed-based approach
        sed -i 's/\]$/,'"$(echo "$CHECKPOINT_ENTRY" | sed 's/[\/&]/\\&/g')"']/' "$CHECKPOINT_HISTORY"
        # Fix for the first entry
        sed -i 's/\[,/[/' "$CHECKPOINT_HISTORY"
    fi
    
    print_success "Checkpoint history updated"
    
    # Remove validation token (single use)
    rm .truthforge/validation-passed
    print_status "Validation token consumed (single-use)"
    
    # Update safety worktree with new checkpoint
    if [ -d "$SAFETY_WORKTREE" ]; then
        cd "$SAFETY_WORKTREE"
        git fetch .. 2>/dev/null || true
        git reset --hard "$COMMIT_HASH"
        cd - > /dev/null
        print_success "Safety worktree updated with checkpoint"
    fi
    
    echo ""
    print_success "🎯 CHECKPOINT SUCCESSFUL"
    echo ""
    echo "Checkpoint Details:"
    echo "  Name: $CHECKPOINT_NAME"
    echo "  Commit: $COMMIT_HASH"
    echo "  Time: $(date)"
    echo "  Safety Backup: $SAFETY_WORKTREE"
    echo ""
    echo "Recovery Commands:"
    echo "  View checkpoints: cat .truthforge/checkpoints.json"
    echo "  Rollback: ./rollback.sh $COMMIT_HASH"
    echo "  Emergency: cd $SAFETY_WORKTREE && git reset --hard $COMMIT_HASH"
    echo ""
    
else
    print_error "Failed to create checkpoint commit"
    exit 1
fi