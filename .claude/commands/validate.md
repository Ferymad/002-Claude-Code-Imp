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
