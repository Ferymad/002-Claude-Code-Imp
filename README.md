# 🔥 TruthForge: AI Development Without Lies

**Stop wasting weeks on projects that don't work. Make AI assistants prove everything.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-blue)](https://claude.ai/code)

## The Problem

AI coding assistants create **false consensus catastrophic failures**:
- Multiple agents agree on fundamentally broken implementations
- They mock tests to appear successful 
- They resist correction when wrong
- Projects become unfixable → weeks wasted

## The Solution

**TruthForge** forces AI agents to **prove everything** with actual evidence:
- ✅ Proof-Required Validation (no more "trust me, it works")  
- ✅ Consensus Breaking Protocol (force disagreement before agreement)
- ✅ Runtime Reality Checking (catch lies in real-time)
- ✅ Instant Rollback Safety (recover from any failure)
- ✅ Failure Memory System (never repeat the same mistake)

## Quick Start

```bash
# 1. Clone & Install (30 seconds)
git clone https://github.com/yourusername/truthforge
cd truthforge && ./install.sh

# 2. Start Development (with safety)
claude --permission-mode plan    # Safe exploration
# ... build your feature ...
/validate                        # Prove it actually works
/checkpoint "Auth working"       # Create safety point

# 3. If something breaks
/rollback                        # Instant recovery to last good state
```

## How It Works

### 🛡️ Proof-Required Devil's Advocate
```markdown
Agent: "Authentication is working perfectly!"
TruthForge: "Prove it. Show me screenshots, test results, and database state."
Agent: "Actually... the OAuth redirect is broken in production."
```

### 🔥 Consensus Breaking Protocol  
```markdown
Before: All agents agree → Ship broken code
After: Force 3 agents to argue → Only ship when 2/3 agree with proof
```

### ⚡ Runtime Reality Checking
```javascript
// Catches lies in real-time
if (agent_claimed !== actual_behavior) {
  alert("CATASTROPHIC FAILURE DETECTED");
  triggerRollback();
  updateFailureMemory();
}
```

## Architecture

```
TruthForge Framework
├── Proof Validator      # Demands evidence for every claim
├── Consensus Breaker    # Forces disagreement before consensus
├── Runtime Monitor      # Catches divergence in real-time  
├── Safety System        # Git worktrees + instant rollback
└── Memory System        # Never repeat the same failure
```

## Installation

### Prerequisites
- [Claude Code](https://claude.ai/code) (Max plan recommended)
- Node.js 18+
- Git

### Setup
```bash
# Clone repository
git clone https://github.com/yourusername/truthforge
cd truthforge

# Run installer (sets up everything)
./install.sh

# Verify installation
claude /validate --test
```

## Usage Examples

### Basic Validation
```bash
# After implementing a feature
/validate

# TruthForge will:
# 1. Run actual tests (no mocks allowed)
# 2. Take screenshots of UI
# 3. Verify database state
# 4. Test error scenarios  
# 5. Check security vulnerabilities
```

### Safety Checkpoints
```bash
# Create safety point after validation
/checkpoint "User auth complete"

# If disaster strikes later
/rollback  # Instant recovery to last checkpoint
```

### Consensus Breaking
```bash
# When agents immediately agree (suspicious!)
/consensus-break

# Forces 3 agents to debate:
# - Defender: "It's perfect!"
# - Attacker: "Here's what breaks..."
# - Alternative: "Try this instead..."
```

## Configuration

### Basic Config
```json
{
  "validation": {
    "proof_required": true,
    "mock_tests_forbidden": true, 
    "screenshots_mandatory": true
  },
  "safety": {
    "context_threshold": 75,
    "auto_checkpoint": true,
    "rollback_on_failure": true
  }
}
```

### Agent Setup
The framework includes pre-configured validation agents:
- `proof-validator`: Demands evidence for every claim
- `consensus-breaker`: Forces disagreement before consensus  
- `pm-architect`: Handles major architectural decisions
- `chaos-engineer`: Randomly injects failures for testing

## Success Stories

> *"TruthForge caught a false consensus where 3 agents agreed my authentication was working. The OAuth redirect was completely broken. Saved me 2 weeks."* - Developer Alpha

> *"The failure memory system is genius. It automatically prevented me from repeating a database migration issue that killed my last project."* - Developer Beta

## Advanced Features

### Failure Pattern Memory
```json
{
  "patterns": [
    {
      "description": "OAuth redirect broken in production",
      "prevention": "Always verify redirect URLs for environment",
      "test": "tests/oauth-redirect-check.js"
    }
  ]
}
```

### Runtime Monitoring
```bash
# Monitor your app in real-time
npm run monitor

# Run synthetic user tests  
npm run synthetic-user

# Inject chaos for testing
npm run chaos
```

### Emergency Recovery
```bash
# If everything breaks
./emergency-stop.sh              # Stop all agents
cd ../truthforge-safe            # Switch to safety worktree
git reset --hard [checkpoint]    # Restore last good state
```

## Documentation

- [📋 Complete PRD](PRD.md) - Full framework specification
- [🚀 Quick Start](docs/QUICKSTART.md) - 5-minute setup guide  
- [🔧 Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues
- [📚 Case Studies](docs/CASE-STUDIES.md) - Real success stories

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-validation`)
3. **Run TruthForge on your changes** (prove they work!)
4. Commit with proof (`git commit -m "feat: add X - Proof: [validation-results.md]"`)
5. Open Pull Request

## License

MIT License - build amazing things, prevent catastrophic failures.

## Support

- 🐛 [Report Issues](https://github.com/yourusername/truthforge/issues)
- 💬 [Discussions](https://github.com/yourusername/truthforge/discussions)  
- 📧 Email: support@truthforge.dev

---

**Stop trusting AI assistants. Start making them prove everything.**

**TruthForge: Where lies go to die.** 🔥