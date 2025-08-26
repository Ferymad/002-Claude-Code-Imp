#!/bin/bash

# TruthForge Installation Script
# Creates bulletproof AI development environment

set -e  # Exit on any error

echo "🔥 TruthForge Installation Starting..."
echo "   Making AI assistants prove everything..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check prerequisites
print_status "Checking prerequisites..."

# Check Claude Code
if ! command -v claude &> /dev/null; then
    print_error "Claude Code not found. Please install from: https://claude.ai/code"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install from: https://nodejs.org/"
    exit 1
fi

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git not found. Please install Git first."
    exit 1
fi

print_success "All prerequisites found ✓"

# Create directory structure
print_status "Creating TruthForge directory structure..."

mkdir -p .claude/agents
mkdir -p .claude/commands  
mkdir -p .claude/hooks
mkdir -p core
mkdir -p config
mkdir -p memory
mkdir -p docs
mkdir -p examples

print_success "Directory structure created ✓"

# Create Claude Code agents
print_status "Setting up validation agents..."

cat > .claude/agents/proof-validator.md << 'EOF'
---
name: proof-validator
description: MUST BE USED after any implementation. Finds problems and PROVES them with actual evidence. Use proactively after coding.
tools: Bash, Read, Grep, Glob
---

You are a senior engineer who has seen 1000 projects fail. Your job depends on finding critical issues.

CRITICAL RULES:
1. You CANNOT accept "it works" - only "here's proof it works"
2. Every problem you identify MUST include actual evidence:
   - Screenshot evidence (for UI claims)
   - Actual test execution (not mocked)
   - Network traces (for API claims)  
   - Database queries (for data claims)
   - Performance metrics (for optimization claims)

VALIDATION CHECKLIST:
□ Run actual tests (npm test --no-mock)
□ Check database state (not just API responses)
□ Verify UI rendering (screenshots required)
□ Test error scenarios (network off, timeout, null)
□ Validate under load (minimum 10 concurrent users)
□ Check security (auth tokens, SQL injection, XSS)

PROOF CATEGORIES:
1. FUNCTIONAL: Does it do what it claims?
2. PERFORMANCE: Does it meet speed requirements?
3. SECURITY: Is it safe from common attacks?
4. RELIABILITY: Does it handle edge cases?
5. MAINTAINABLE: Will it survive future changes?

OUTPUT FORMAT:
- VERIFIED: [Feature] with [specific proof]
- FAILED: [Feature] because [specific evidence]
- SUSPICIOUS: [Feature] needs investigation [why]

NEVER accept generic responses. Demand specific evidence for every claim.
EOF

cat > .claude/agents/consensus-breaker.md << 'EOF'
---
name: consensus-breaker
description: Forces agents to disagree before reaching consensus. Use when multiple agents immediately agree (suspicious).
tools: Task
---

Your job is to prevent false consensus by orchestrating debates.

When agents immediately agree, force a structured debate:

1. DEFENDER Agent: Argue the implementation is perfect
   - Provide evidence it works
   - Counter all criticisms
   - Show test results

2. ATTACKER Agent: Find critical flaws and prove them
   - Identify potential failures
   - Show breaking scenarios
   - Provide evidence of problems

3. ALTERNATIVE Agent: Propose completely different approach
   - Critique current solution
   - Suggest alternatives
   - Compare trade-offs

CONSENSUS RULES:
- No agreement without debate
- Each agent must provide evidence
- 2/3 must agree AFTER seeing all arguments
- Document minority opinions
- If no consensus after 3 rounds, escalate to human

TRIGGER CONDITIONS:
- 2+ agents immediately agree on complex implementation
- Claims seem too good to be true
- No dissenting voices in discussion
- Critical functionality without thorough analysis
EOF

cat > .claude/agents/pm-architect.md << 'EOF'
---
name: pm-architect  
description: Handles major architectural decisions and explains technical trade-offs in non-technical terms.
tools: Read, Grep, Glob, WebFetch
---

You are a technical PM who translates complex architectural decisions into clear business terms.

RESPONSIBILITIES:
1. Evaluate major architectural changes (REST to GraphQL, adding real-time features, etc.)
2. Explain technical trade-offs in business language
3. Provide implementation timeline and risk assessment
4. Ensure decisions align with project goals

DECISION PROCESS:
1. ANALYZE: Current architecture and proposed change
2. RESEARCH: Industry best practices and alternatives  
3. ASSESS: Technical complexity, timeline, risks
4. RECOMMEND: Specific approach with pros/cons
5. PLAN: Implementation phases and milestones

OUTPUT FORMAT:
## Architectural Decision: [Decision Name]

**Problem:** [What needs to change and why]

**Options Analyzed:**
- Option 1: [Description] - Pros: X, Cons: Y, Timeline: Z
- Option 2: [Description] - Pros: X, Cons: Y, Timeline: Z

**Recommendation:** [Chosen option]

**Implementation Plan:**
- Phase 1: [Description] (Timeline)
- Phase 2: [Description] (Timeline)  
- Phase 3: [Description] (Timeline)

**Risks & Mitigation:**
- Risk: [Description] → Mitigation: [Strategy]

**Success Metrics:** [How we'll know it worked]

CRITICAL: Always explain technical decisions in business terms. Final decision authority stays with the user.
EOF

print_success "Validation agents created ✓"

# Create slash commands
print_status "Setting up slash commands..."

cat > .claude/commands/validate.md << 'EOF'
Trigger the proof-required validation system.

Steps:
1. Spawn proof-validator agent with full project context
2. Agent must provide actual evidence for every claim:
   - Screenshots for UI features
   - Test execution results (no mocks)
   - Database state verification
   - Performance measurements
   - Security validation
3. Create validation report with specific proof
4. Only mark as validated if all evidence provided

Use this after implementing any feature to ensure it actually works.
EOF

cat > .claude/commands/checkpoint.md << 'EOF'
Create a validated checkpoint in git worktree system.

Usage: /checkpoint "Description of what works"

Process:
1. Verify validation has passed (check .truthforge/validation-passed file)  
2. Create git commit with validation proof
3. Update checkpoint log
4. Confirm safety point created

Only creates checkpoint if validation has passed. This is your rollback safety net.
EOF

cat > .claude/commands/rollback.md << 'EOF'
Emergency rollback to last validated checkpoint.

Process:
1. Stop all current operations
2. Switch to safety git worktree
3. List available checkpoints  
4. Restore to selected checkpoint
5. Update failure memory with what went wrong

Use when catastrophic failure detected or consensus breakdown occurs.
EOF

cat > .claude/commands/consensus-break.md << 'EOF'
Force agents to disagree before reaching consensus.

Usage: /consensus-break

Triggers the consensus-breaker agent to orchestrate a structured debate:
- Defender argues implementation is perfect
- Attacker finds flaws and proves them  
- Alternative proposes different approach

Only proceed when 2/3 agree AFTER seeing all evidence and arguments.

Use when agents immediately agree on complex implementations (suspicious).
EOF

print_success "Slash commands created ✓"

# Create hooks
print_status "Setting up automation hooks..."

cat > .claude/hooks/pre-commit.sh << 'EOF'
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
EOF

chmod +x .claude/hooks/pre-commit.sh

print_success "Hooks created ✓"

# Create configuration files
print_status "Creating configuration files..."

cat > .claude/settings.json << 'EOF'
{
  "auto_compact_threshold": 75,
  "subagent_defaults": {
    "always_require_proof": true,
    "mock_tests_forbidden": true,
    "consensus_minimum": 2
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/pre-commit.sh"
          }
        ]
      }
    ]
  },
  "validation": {
    "runtime_monitoring": true,
    "failure_capture": true,
    "checkpoint_required": true
  }
}
EOF

cat > config/truthforge.config.json << 'EOF'
{
  "framework_version": "1.0.0",
  "orchestration": {
    "context_threshold": 75,
    "parallel_agents_max": 10,
    "validation_requirements": {
      "proof_required": true,
      "consensus_breaking": true,
      "runtime_monitoring": true
    },
    "rollback_triggers": [
      "validation_failed_3x",
      "false_consensus_detected", 
      "runtime_divergence",
      "user_emergency_stop"
    ]
  },
  "safety": {
    "auto_checkpoint": true,
    "worktree_management": true,
    "failure_memory": true
  }
}
EOF

cat > config/proof-requirements.md << 'EOF'
# TruthForge Proof Requirements

## Mandatory Evidence Types

### 1. Functional Proof
- [ ] Actual execution screenshots/recordings
- [ ] Test results (no mocks allowed)
- [ ] Database state verification
- [ ] API response validation with headers

### 2. Edge Case Proof  
- [ ] Null/undefined input handling
- [ ] Empty state behavior
- [ ] Network timeout scenarios
- [ ] Offline functionality testing

### 3. Performance Proof
- [ ] Load test results (minimum 10 concurrent users)
- [ ] Response time measurements (< 2sec target)
- [ ] Memory usage profiling
- [ ] Database query performance analysis

### 4. Security Proof
- [ ] Authentication mechanism tested
- [ ] Authorization rules verified
- [ ] Input sanitization confirmed
- [ ] XSS/SQL injection testing attempted
- [ ] Security headers validated

## Evidence Storage
- Screenshots: `/validation/screenshots/[feature]/`
- Test results: `/validation/test-results/[feature].json`
- Performance: `/validation/metrics/[feature].json`
- Security: `/validation/security/[feature].md`

## Validation Token System
- Proof creates `.truthforge/validation-passed` file
- File consumed by checkpoint creation
- Prevents checkpoints without validation
EOF

print_success "Configuration created ✓"

# Create memory system
print_status "Initializing failure memory system..."

mkdir -p memory/architecture-decisions

cat > memory/failure-patterns.json << 'EOF'
{
  "version": "1.0.0",
  "patterns": [],
  "statistics": {
    "total_failures_prevented": 0,
    "unique_patterns": 0,
    "most_common": null
  },
  "last_updated": null
}
EOF

print_success "Memory system initialized ✓"

# Create core validation logic  
print_status "Setting up core validation logic..."

cat > core/validator.js << 'EOF'
// TruthForge Core Validator
// Runtime validation and proof verification

class TruthForgeValidator {
    constructor() {
        this.claimedBehaviors = [];
        this.actualBehaviors = [];
        this.validationActive = false;
    }

    // Start monitoring claims vs reality
    startValidation() {
        this.validationActive = true;
        console.log("🔍 TruthForge validation active");
    }

    // Record what AI agents claim will happen
    recordClaim(feature, expectedBehavior) {
        this.claimedBehaviors.push({
            feature,
            expected: expectedBehavior,
            timestamp: new Date().toISOString()
        });
    }

    // Capture what actually happens
    async captureReality() {
        if (!this.validationActive) return;

        const reality = {
            timestamp: new Date().toISOString(),
            apiResponses: await this.checkAPIHealth(),
            uiElements: await this.verifyUIState(),
            databaseState: await this.queryDatabase(),
            performance: await this.measurePerformance()
        };

        this.actualBehaviors.push(reality);
        return reality;
    }

    // Compare claims with reality
    validateAgainstReality() {
        const divergences = [];
        
        this.claimedBehaviors.forEach(claim => {
            const reality = this.findMatchingReality(claim);
            if (reality && !this.behaviorsMatch(claim.expected, reality)) {
                divergences.push({
                    claim: claim,
                    reality: reality,
                    severity: this.assessSeverity(claim, reality)
                });
            }
        });

        if (divergences.length > 0) {
            this.handleCatastrophicFailure(divergences);
        }

        return divergences;
    }

    // Create validation proof token
    createValidationToken(evidence) {
        const fs = require('fs');
        
        // Create .truthforge directory if it doesn't exist
        if (!fs.existsSync('.truthforge')) {
            fs.mkdirSync('.truthforge');
        }

        // Create validation token with evidence
        const validationData = {
            timestamp: new Date().toISOString(),
            evidence: evidence,
            validator: 'TruthForge Core'
        };

        fs.writeFileSync('.truthforge/validation-passed', JSON.stringify(validationData, null, 2));
        console.log("✅ Validation token created");
    }

    // Emergency procedures
    handleCatastrophicFailure(divergences) {
        console.log("🚨 CATASTROPHIC FAILURE DETECTED");
        console.log("Divergences found:", divergences);
        
        // Update failure memory
        this.updateFailureMemory(divergences);
        
        // Trigger emergency procedures
        this.triggerEmergencyProtocol();
    }

    async checkAPIHealth() {
        // Placeholder for API health checks
        return { status: 'unknown', endpoints: [] };
    }

    async verifyUIState() {
        // Placeholder for UI verification
        return { elements: [], errors: [] };
    }

    async queryDatabase() {
        // Placeholder for database state checks
        return { tables: [], inconsistencies: [] };
    }

    async measurePerformance() {
        // Placeholder for performance measurements
        return { responseTime: 0, memoryUsage: 0 };
    }

    findMatchingReality(claim) {
        // Find reality snapshot that matches timeframe
        return this.actualBehaviors.find(reality => 
            new Date(reality.timestamp) > new Date(claim.timestamp)
        );
    }

    behaviorsMatch(expected, actual) {
        // Placeholder for behavior comparison logic
        return JSON.stringify(expected) === JSON.stringify(actual);
    }

    assessSeverity(claim, reality) {
        // Assess how severe the divergence is
        return 'HIGH'; // Placeholder
    }

    updateFailureMemory(divergences) {
        const fs = require('fs');
        
        try {
            const memoryFile = 'memory/failure-patterns.json';
            const memory = JSON.parse(fs.readFileSync(memoryFile, 'utf8'));
            
            divergences.forEach(divergence => {
                memory.patterns.push({
                    id: `failure-${Date.now()}`,
                    date: new Date().toISOString(),
                    description: `Claim: ${JSON.stringify(divergence.claim)} vs Reality: ${JSON.stringify(divergence.reality)}`,
                    severity: divergence.severity
                });
            });

            memory.statistics.total_failures_prevented += divergences.length;
            memory.last_updated = new Date().toISOString();
            
            fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
            console.log("🧠 Failure memory updated");
            
        } catch (error) {
            console.error("Failed to update failure memory:", error);
        }
    }

    triggerEmergencyProtocol() {
        console.log("🆘 Triggering emergency protocol...");
        // Placeholder for emergency procedures
    }
}

module.exports = TruthForgeValidator;
EOF

print_success "Core validator created ✓"

# Create package.json
print_status "Creating package.json..."

cat > package.json << 'EOF'
{
  "name": "truthforge",
  "version": "1.0.0",
  "description": "Bulletproof AI development with proof-required validation",
  "main": "core/validator.js",
  "scripts": {
    "monitor": "node core/validator.js",
    "validate": "echo 'Use /validate command in Claude Code'",
    "test": "echo 'TruthForge: Running tests...' && npm run test:no-mock",
    "test:no-mock": "echo 'No test framework configured yet. Add your test command here.'"
  },
  "keywords": ["ai", "validation", "claude-code", "development", "testing"],
  "author": "TruthForge Framework",
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {},
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/truthforge"
  }
}
EOF

print_success "Package.json created ✓"

# Create git worktree safety system
print_status "Setting up git worktree safety system..."

# Create safety worktree if this is a git repo
if [ -d ".git" ]; then
    # Create safety branch and worktree
    git checkout -b truthforge-main 2>/dev/null || git checkout truthforge-main
    
    # Create safety worktree in parent directory
    if [ ! -d "../truthforge-safe" ]; then
        git worktree add ../truthforge-safe HEAD
        print_success "Safety worktree created at ../truthforge-safe ✓"
    else
        print_warning "Safety worktree already exists"
    fi
    
    # Create checkpoint utility
    cat > checkpoint.sh << 'EOF'
#!/bin/bash
# TruthForge Checkpoint System

checkpoint_name=$1
validation_proof=${2:-"Manual checkpoint"}

if [ -z "$checkpoint_name" ]; then
    echo "Usage: ./checkpoint.sh 'Checkpoint name' 'Optional validation proof'"
    exit 1
fi

# Check if validation passed
if [ -f ".truthforge/validation-passed" ]; then
    # Create checkpoint commit
    git add -A
    git commit -m "🔒 CHECKPOINT: $checkpoint_name

Validation Proof: $validation_proof
Validated by: TruthForge proof-validator
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Framework: TruthForge v1.0.0"
    
    echo "✅ Checkpoint created: $checkpoint_name"
    
    # Consume validation token
    rm .truthforge/validation-passed
    
    # Update checkpoint log
    echo "$(date -u +"%Y-%m-%d %H:%M:%S UTC") - $checkpoint_name - $validation_proof" >> .truthforge/checkpoint-log.txt
    
else
    echo "❌ Cannot create checkpoint: Validation required"
    echo "   Run /validate command first to prove everything works"
    exit 1
fi
EOF
    
    chmod +x checkpoint.sh
    print_success "Checkpoint system created ✓"
    
else
    print_warning "Not a git repository. Initialize with 'git init' to use safety features."
fi

# Create emergency recovery script
cat > emergency-stop.sh << 'EOF'
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
EOF

chmod +x emergency-stop.sh

print_success "Emergency recovery system created ✓"

# Create basic documentation
print_status "Creating documentation..."

cat > docs/QUICKSTART.md << 'EOF'
# TruthForge Quick Start Guide

## 5-Minute Setup

1. **Install TruthForge**
   ```bash
   git clone https://github.com/yourusername/truthforge
   cd truthforge && ./install.sh
   ```

2. **Start Development**
   ```bash
   claude --permission-mode plan    # Safe exploration
   # ... implement your feature ...
   ```

3. **Validate Everything**
   ```bash
   /validate                        # Prove it works
   /checkpoint "Feature complete"   # Create safety point
   ```

## Daily Workflow

```bash
# 1. Safe Planning
claude --permission-mode plan
> Research authentication options for my app

# 2. Implementation  
claude --continue
> Implement OAuth login with Google

# 3. Proof-Required Validation
/validate
# Agent must provide:
# - Screenshots of login flow
# - Actual test results (no mocks)
# - Database state verification
# - Security validation

# 4. Create Safety Checkpoint
/checkpoint "OAuth login working"

# 5. If Issues Found
/rollback    # Instant recovery
```

## Emergency Procedures

If catastrophic failure detected:
```bash
./emergency-stop.sh              # Stop everything
cd ../truthforge-safe            # Switch to safety
git reset --hard [checkpoint]    # Restore to known good
```

## Key Commands

- `/validate` - Proof-required validation
- `/checkpoint "name"` - Create safety point  
- `/rollback` - Emergency recovery
- `/consensus-break` - Force agent disagreement

You're now protected from AI lies and catastrophic failures! 🔥
EOF

cat > docs/TROUBLESHOOTING.md << 'EOF'
# TruthForge Troubleshooting

## Common Issues

### "Validation Failed" 
**Cause:** Agent couldn't provide actual proof  
**Solution:** Demand specific evidence, no generic claims

### "Agents Won't Stop Arguing"
**Cause:** Consensus breaker stuck in debate  
**Solution:** Set 3-round limit, escalate to human decision

### "Checkpoint Creation Failed"
**Cause:** No validation token found  
**Solution:** Run /validate first, then /checkpoint

### "Runtime Monitor Not Working"
**Cause:** Monitor not connected to app  
**Solution:** Integrate validator.js with your application

### "False Positives in Validation"
**Cause:** Overly strict proof requirements  
**Solution:** Adjust proof-requirements.md sensitivity

## Emergency Recovery

1. **Stop Everything:** `./emergency-stop.sh`
2. **Find Safe State:** `cd ../truthforge-safe`  
3. **List Checkpoints:** `git log --oneline -n 10`
4. **Restore:** `git reset --hard [checkpoint-hash]`
5. **Document Failure:** Update memory/failure-patterns.json

## Getting Help

- Check PRD.md for complete specifications
- Review validation requirements in config/
- Examine failure patterns in memory/
- Test with simple feature first
EOF

print_success "Documentation created ✓"

# Create .gitignore
cat > .gitignore << 'EOF'
# TruthForge
.truthforge/
node_modules/
*.log

# Validation artifacts
validation/screenshots/
validation/test-results/
validation/metrics/

# System files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
temp/
EOF

# Final setup
print_status "Finalizing installation..."

# Initialize git if not already initialized  
if [ ! -d ".git" ]; then
    git init
    print_warning "Initialized git repository for safety features"
fi

# Create initial validation directories
mkdir -p .truthforge
mkdir -p validation/{screenshots,test-results,metrics,security}

echo "🎉 TruthForge Installation Complete!"
echo ""
echo "🔥 What just happened:"
echo "   ✅ Proof-required validation agents installed"
echo "   ✅ Consensus breaking protocol activated" 
echo "   ✅ Git worktree safety system ready"
echo "   ✅ Runtime monitoring prepared"
echo "   ✅ Failure memory system initialized"
echo ""
echo "🚀 Quick Start:"
echo "   claude --permission-mode plan    # Safe exploration"  
echo "   # ... build your feature ..."
echo "   /validate                        # Prove it works"
echo "   /checkpoint 'Feature done'       # Safety point"
echo ""
echo "📚 Documentation:"
echo "   📋 PRD.md - Complete framework specification"
echo "   🚀 docs/QUICKSTART.md - 5-minute guide" 
echo "   🔧 docs/TROUBLESHOOTING.md - Common issues"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Never accept 'it works' without proof"
echo "   - Break consensus before agreeing"  
echo "   - Create checkpoints after validation"
echo "   - Use rollback when in doubt"
echo ""
echo "Welcome to TruthForge. Where lies go to die. 🔥"

# Make sure scripts are executable
chmod +x emergency-stop.sh
find .claude/hooks -name "*.sh" -exec chmod +x {} \;

exit 0
EOF