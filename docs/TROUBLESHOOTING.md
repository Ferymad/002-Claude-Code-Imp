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
