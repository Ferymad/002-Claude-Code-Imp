# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

TruthForge is a production-ready AI development validation framework that prevents "false consensus catastrophic failures" through comprehensive proof-required validation. It has been fully enhanced with real validation tools, security scanning, screenshot capture, and safety systems.

## Common Commands

### Development Commands
```bash
# Install and setup the framework
./install.sh

# Run comprehensive validation with all evidence collection
node run-validation.js --comprehensive

# Quick validation
node run-validation.js

# Validation with test execution  
node run-validation.js --run-tests

# Emergency recovery
./emergency-stop.sh
```

### TruthForge Custom Commands
```bash
# Create validated checkpoint (requires validation token)
./checkpoint.sh "Feature name" "Validation proof"

# Framework validation commands (use in Claude Code)
/validate            # Trigger proof-required validation
/checkpoint "name"    # Create safety checkpoint
/rollback            # Emergency rollback to last checkpoint
/consensus-break     # Force agent disagreement before consensus
```

## Architecture

The TruthForge framework operates in layers:

### Orchestration Layer
- **Context Threshold**: 75% (not 95% - framework enforces early context management)
- **Agent Dispatcher**: Manages validation agents automatically
- **Parallel Processing**: Max 10 agents for validation tasks

### Validation Layer
- **Comprehensive Validator**: Real implementation with screenshot capture, security scanning, performance testing
- **Security Validator**: Actual vulnerability scanning with 8 security test categories 
- **UI Validator**: Automated screenshot capture of running applications
- **Performance Validator**: System benchmarking and load testing capabilities
- **Database Validator**: Real database integrity and state verification
- **Consensus Breaker**: Forces disagreement before allowing consensus on complex implementations  
- **Runtime Monitor**: Compares claimed behavior vs actual behavior with detailed evidence

### Safety Layer
- **Git Worktree Manager**: Creates safety worktrees in `../truthforge-safe`
- **Checkpoint System**: Only allows checkpoints after validation passes
- **Rollback Protocol**: Emergency recovery to last known good state

### Memory Layer
- **Failure Patterns**: `memory/failure-patterns.json` stores prevented failures
- **Architecture Decisions**: `memory/architecture-decisions/` tracks major decisions

## Critical Framework Rules

1. **No Mocks Allowed**: All tests must run with actual implementations
2. **Proof Required**: Every claim must be backed by evidence:
   - Screenshots for UI features
   - Actual test execution results  
   - Database state verification
   - Performance measurements
   - Security validation
3. **Validation Before Checkpoints**: Cannot create checkpoints without validation token (`.truthforge/validation-passed`)
4. **Consensus Breaking**: When agents immediately agree, force structured debate first
5. **Context Management**: Switch contexts at 75%, not when approaching limits

## Key Files

### Core System Files
- `core/validator.js` - Runtime validation logic and failure detection
- `config/truthforge.config.json` - Framework configuration
- `config/proof-requirements.md` - Mandatory evidence checklist
- `memory/failure-patterns.json` - Database of prevented failures

### Claude Code Integration
- `.claude/agents/proof-validator.md` - Agent that demands evidence for all claims
- `.claude/agents/consensus-breaker.md` - Agent that forces disagreement before consensus
- `.claude/agents/pm-architect.md` - Agent for major architectural decisions
- `.claude/commands/validate.md` - Proof-required validation command
- `.claude/commands/checkpoint.md` - Validated checkpoint creation
- `.claude/commands/rollback.md` - Emergency rollback command
- `.claude/hooks/pre-commit.sh` - Automated validation before commits

### Validation Evidence Storage
- `validation/screenshots/` - UI proof screenshots
- `validation/test-results/` - Actual test execution results
- `validation/metrics/` - Performance measurements
- `validation/security/` - Security validation results

## Validation Process

1. **Implementation**: Build feature using standard development practices
2. **Validation**: Use `/validate` command to trigger proof-validator agent
3. **Evidence Collection**: Agent must provide:
   - Screenshots of working feature
   - Test execution results (no mocks)
   - Database state verification
   - Performance metrics
   - Security validation
4. **Consensus Breaking**: If multiple agents agree immediately, force structured debate
5. **Checkpoint**: Only after validation passes, create checkpoint with `/checkpoint`
6. **Runtime Monitoring**: `core/validator.js` monitors for claim vs reality divergence

## Emergency Procedures

If catastrophic failure detected:
```bash
./emergency-stop.sh              # Stop all operations
cd ../truthforge-safe            # Switch to safety worktree  
git log --oneline -n 5           # Find last good checkpoint
git reset --hard [checkpoint]    # Restore to known good state
```

## Development Workflow

1. **Safe Planning**: Use `claude --permission-mode plan` for exploration
2. **Implementation**: Build feature with existing patterns and libraries
3. **Validation**: Run `/validate` - agent must provide actual evidence  
4. **Checkpoint**: After validation passes, run `/checkpoint "feature name"`
5. **If Issues**: Use `/rollback` for instant recovery

## Agent Usage Guidelines

- **proof-validator**: Use after any implementation to find and prove problems
- **consensus-breaker**: Use when agents immediately agree on complex implementations
- **pm-architect**: Use for major architectural decisions requiring business analysis

## Framework Philosophy

TruthForge transforms development from "hope it works" to "prove it works" by:
- Preventing fake success through evidence requirements
- Breaking false consensus before it forms
- Enabling instant rollback when failures occur
- Learning from failures to prevent repetition

Remember: Never accept "it works" without proof, always break consensus before agreeing, and use checkpoints as safety nets.