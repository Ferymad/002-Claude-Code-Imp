Emergency rollback to last validated checkpoint.

Process:
1. Stop all current operations
2. Switch to safety git worktree
3. List available checkpoints  
4. Restore to selected checkpoint
5. Update failure memory with what went wrong

Use when catastrophic failure detected or consensus breakdown occurs.
