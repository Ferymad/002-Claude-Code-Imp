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
