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
