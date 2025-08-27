---
allowed-tools: Bash(node:*, npm:*, python:*), Read, Write, Grep, Glob, Task
description: Trigger TruthForge proof-required comprehensive validation
---

# TruthForge Comprehensive Validation

Launch the TruthForge validation system that creates proof-based evidence for all functionality.

## Validation Process

1. **Initialize Validator**: Start the TruthForge comprehensive validation engine
2. **Capture System Reality**: Document current state of all systems
3. **Security Validation**: Run comprehensive security tests and vulnerability scanning
4. **UI Evidence Collection**: Capture screenshots of all running interfaces
5. **Performance Analysis**: Measure system performance and load capabilities
6. **Test Execution**: Run all available test suites (no mocks allowed)
7. **Claim Verification**: Validate any previously recorded behavioral claims
8. **Evidence Synthesis**: Generate comprehensive validation report

## Evidence Requirements

The validation system MUST provide actual evidence for:
- **Screenshots**: Visual proof of UI functionality
- **Test Results**: Actual test execution output (no mocks)
- **Security Report**: Vulnerability scan results and security assessment
- **Performance Metrics**: Response times, load capacity, resource usage
- **Database State**: Actual database content and integrity verification
- **API Health**: Live endpoint testing and response validation

## Success Criteria

Validation passes ONLY if:
- Overall score ≥ 60%
- No critical security vulnerabilities
- All tests pass (if tests exist)
- No critical claim vs reality divergences
- All evidence successfully collected

## Usage

```bash
# Basic validation
/validate

# With test execution
/validate --run-tests

# Full comprehensive validation
/validate --comprehensive
```

This command automatically:
1. Runs the TruthForge validator
2. Collects all evidence types
3. Generates validation token if successful
4. Creates detailed validation report
5. Provides specific recommendations for any issues found

**CRITICAL**: Only creates validation token after ALL evidence requirements are met. No shortcuts allowed.
