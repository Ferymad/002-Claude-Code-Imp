#!/bin/bash

# TruthForge Rollback System
# Emergency rollback to validated checkpoints

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[ROLLBACK]${NC} $1"
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

print_emergency() {
    echo -e "${PURPLE}[EMERGENCY]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "TruthForge Rollback System"
    echo "Usage: $0 [options] [commit_hash]"
    echo ""
    echo "Options:"
    echo "  --list         List available checkpoints"
    echo "  --last         Rollback to last checkpoint"
    echo "  --emergency    Emergency rollback (no confirmations)"
    echo "  --help         Show this help message"
    echo ""
    echo "Arguments:"
    echo "  commit_hash    Specific commit to rollback to (optional)"
    echo ""
    echo "Examples:"
    echo "  $0 --list                    # Show available checkpoints"
    echo "  $0 --last                    # Rollback to last checkpoint"
    echo "  $0 abc123                    # Rollback to specific commit"
    echo "  $0 --emergency abc123        # Emergency rollback without prompts"
    echo ""
    echo "Safety Features:"
    echo "  • Creates backup before rollback"
    echo "  • Verifies target commit exists"
    echo "  • Updates failure memory"
    echo "  • Works with safety worktree"
}

# Function to list checkpoints
list_checkpoints() {
    print_status "Available TruthForge checkpoints:"
    echo ""
    
    if [ -f ".truthforge/checkpoints.json" ]; then
        if command -v jq >/dev/null 2>&1; then
            jq -r '.checkpoints[] | "🎯 \(.name) (\(.commit[0:7])) - \(.timestamp)"' .truthforge/checkpoints.json
        else
            # Simple grep-based parsing
            grep -o '"name":"[^"]*"' .truthforge/checkpoints.json | sed 's/"name":"//; s/"//' | while read name; do
                echo "🎯 $name"
            done
        fi
        echo ""
        print_status "Use 'git log --oneline' to see all commits"
    else
        print_warning "No checkpoint history found"
        print_status "Looking for recent commits with CHECKPOINT:"
        git log --oneline --grep="CHECKPOINT:" -10 || true
    fi
}

# Function to get last checkpoint
get_last_checkpoint() {
    if [ -f ".truthforge/checkpoints.json" ]; then
        if command -v jq >/dev/null 2>&1; then
            jq -r '.checkpoints[-1].commit' .truthforge/checkpoints.json 2>/dev/null || echo ""
        else
            # Simple tail-based approach
            grep -o '"commit":"[^"]*"' .truthforge/checkpoints.json | tail -1 | sed 's/"commit":"//; s/"//' || echo ""
        fi
    else
        # Find last commit with CHECKPOINT in message
        git log --format="%H" --grep="CHECKPOINT:" -1 2>/dev/null || echo ""
    fi
}

# Function to verify commit exists and is safe
verify_commit() {
    local commit="$1"
    
    if ! git cat-file -e "$commit" 2>/dev/null; then
        print_error "Commit $commit does not exist"
        return 1
    fi
    
    # Check if commit has TruthForge checkpoint marker
    if git show --format="%B" -s "$commit" | grep -q "CHECKPOINT:"; then
        print_success "Commit $commit is a validated TruthForge checkpoint ✓"
        return 0
    else
        print_warning "Commit $commit is not a TruthForge checkpoint"
        print_warning "This may not be a safe rollback target"
        return 2
    fi
}

# Function to create pre-rollback backup
create_backup() {
    local backup_name="pre-rollback-$(date +%Y%m%d-%H%M%S)"
    
    print_status "Creating pre-rollback backup..."
    
    if git diff-index --quiet HEAD --; then
        print_status "Working directory is clean, creating backup commit"
    else
        print_status "Staging and backing up uncommitted changes"
        git add .
    fi
    
    if git commit -m "BACKUP: $backup_name - before rollback to $1" 2>/dev/null; then
        BACKUP_COMMIT=$(git rev-parse HEAD)
        print_success "Backup created: $BACKUP_COMMIT"
        echo "    Recovery: git cherry-pick $BACKUP_COMMIT"
    else
        print_status "No changes to backup"
    fi
}

# Function to update failure memory
update_failure_memory() {
    local rollback_commit="$1"
    local reason="$2"
    
    print_status "Updating failure memory..."
    
    mkdir -p memory
    
    if [ ! -f "memory/failure-patterns.json" ]; then
        cat > memory/failure-patterns.json << 'EOF'
{
  "patterns": [],
  "statistics": {
    "total_failures_prevented": 0,
    "rollbacks_performed": 0,
    "last_updated": ""
  }
}
EOF
    fi
    
    # Simple update using sed (more portable than jq)
    local timestamp=$(date -Iseconds)
    local rollback_entry="{\"id\":\"rollback-$(date +%s)\",\"timestamp\":\"$timestamp\",\"type\":\"rollback\",\"target_commit\":\"$rollback_commit\",\"reason\":\"$reason\"}"
    
    # Update rollback count and timestamp
    sed -i "s/\"rollbacks_performed\":[0-9]*/\"rollbacks_performed\":$(($(grep -o '"rollbacks_performed":[0-9]*' memory/failure-patterns.json | cut -d: -f2) + 1))/g" memory/failure-patterns.json
    sed -i "s/\"last_updated\":\"[^\"]*\"/\"last_updated\":\"$timestamp\"/g" memory/failure-patterns.json
    
    print_success "Failure memory updated"
}

# Main script logic
EMERGENCY_MODE=false
TARGET_COMMIT=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --list)
            list_checkpoints
            exit 0
            ;;
        --last)
            TARGET_COMMIT=$(get_last_checkpoint)
            if [ -z "$TARGET_COMMIT" ]; then
                print_error "No checkpoints found"
                exit 1
            fi
            shift
            ;;
        --emergency)
            EMERGENCY_MODE=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        -*)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
        *)
            if [ -z "$TARGET_COMMIT" ]; then
                TARGET_COMMIT="$1"
            fi
            shift
            ;;
    esac
done

# Show usage if no target specified
if [ -z "$TARGET_COMMIT" ]; then
    print_error "No rollback target specified"
    show_usage
    exit 1
fi

print_emergency "🚨 TruthForge Emergency Rollback System"
echo ""
print_status "Target commit: $TARGET_COMMIT"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a Git repository"
    exit 1
fi

# Verify target commit
verify_commit "$TARGET_COMMIT"
COMMIT_VERIFICATION=$?

if [ $COMMIT_VERIFICATION -eq 1 ]; then
    exit 1
elif [ $COMMIT_VERIFICATION -eq 2 ] && [ "$EMERGENCY_MODE" = false ]; then
    echo ""
    read -p "Continue rollback to unverified commit? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Rollback cancelled"
        exit 0
    fi
fi

# Show commit details
echo ""
print_status "Rollback target details:"
git show --format="%h %s%n%n%b" -s "$TARGET_COMMIT" | head -10

if [ "$EMERGENCY_MODE" = false ]; then
    echo ""
    print_warning "This will reset your working directory to the target commit"
    print_warning "All changes after $TARGET_COMMIT will be lost"
    echo ""
    read -p "Continue with rollback? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Rollback cancelled"
        exit 0
    fi
fi

# Create backup before rollback
create_backup "$TARGET_COMMIT"

# Perform rollback
print_status "Performing rollback to $TARGET_COMMIT..."

if git reset --hard "$TARGET_COMMIT"; then
    print_success "🎯 Rollback completed successfully"
    
    # Update failure memory
    update_failure_memory "$TARGET_COMMIT" "Emergency rollback performed"
    
    # Clean up any validation tokens (may be stale)
    if [ -f ".truthforge/validation-passed" ]; then
        rm .truthforge/validation-passed
        print_status "Removed stale validation token"
    fi
    
    echo ""
    print_success "✅ ROLLBACK SUCCESSFUL"
    echo ""
    echo "Current state:"
    echo "  Commit: $(git rev-parse --short HEAD)"
    echo "  Message: $(git show --format="%s" -s HEAD)"
    echo "  Time: $(date)"
    echo ""
    echo "Next steps:"
    echo "  1. Verify system is working: npm test (or equivalent)"
    echo "  2. Re-validate if making changes: /validate"
    echo "  3. Create new checkpoint when ready: ./checkpoint.sh"
    echo ""
    
else
    print_error "Rollback failed"
    print_emergency "System may be in inconsistent state"
    print_emergency "Manual intervention required"
    exit 1
fi