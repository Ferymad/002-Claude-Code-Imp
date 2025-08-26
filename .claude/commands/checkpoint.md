Create a validated checkpoint in git worktree system.

Usage: /checkpoint "Description of what works"

Process:
1. Verify validation has passed (check .truthforge/validation-passed file)  
2. Create git commit with validation proof
3. Update checkpoint log
4. Confirm safety point created

Only creates checkpoint if validation has passed. This is your rollback safety net.
