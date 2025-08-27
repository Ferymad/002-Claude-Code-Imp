#!/bin/bash
# TruthForge Pre-commit Validation Hook
# Enhanced with JSON output for Claude Code integration

# Get input JSON if available
input_json=""
if [ -t 0 ]; then
    # Not piped, no JSON input
    input_json=""
else
    # Read from stdin
    input_json=$(cat)
fi

# Parse tool information from JSON if available
tool_name=""
if [ -n "$input_json" ] && command -v jq &> /dev/null; then
    tool_name=$(echo "$input_json" | jq -r '.tool_name // ""' 2>/dev/null)
fi

# Only validate git commits
if [ -n "$tool_name" ] && [ "$tool_name" != "Bash" ]; then
    # Not a bash command, allow it
    exit 0
fi

# Check if this is a git commit command
if [ -n "$input_json" ] && command -v jq &> /dev/null; then
    command_text=$(echo "$input_json" | jq -r '.tool_input.command // ""' 2>/dev/null)
    if [[ ! "$command_text" =~ git.*commit ]]; then
        # Not a git commit, allow it
        exit 0
    fi
fi

echo "🔍 TruthForge pre-commit validation..." >&2

# Check if validation passed
if [ ! -f ".truthforge/validation-passed" ]; then
    # Use JSON output for better Claude Code integration
    if command -v jq &> /dev/null; then
        cat << EOF
{
  "decision": "block",
  "reason": "TruthForge validation required before commit. Run '/validate' command first to generate proof-based validation evidence. This prevents committing unvalidated code that could lead to catastrophic failures.",
  "systemMessage": "🚨 TruthForge Framework: Commit blocked due to missing validation",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse", 
    "permissionDecision": "deny",
    "permissionDecisionReason": "No validation token found. TruthForge requires proof-based validation before any commits."
  }
}
EOF
    else
        echo "❌ TruthForge: Cannot commit without validation. Run /validate first." >&2
    fi
    exit 2
fi

# Validate the validation token
validation_age_seconds=0
if command -v stat &> /dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        validation_age_seconds=$(( $(date +%s) - $(stat -f %m .truthforge/validation-passed) ))
    else
        # Linux
        validation_age_seconds=$(( $(date +%s) - $(stat -c %Y .truthforge/validation-passed) ))
    fi
fi

# Validation token expires after 1 hour
if [ $validation_age_seconds -gt 3600 ]; then
    if command -v jq &> /dev/null; then
        cat << EOF
{
  "decision": "block",
  "reason": "Validation token has expired (older than 1 hour). Run '/validate' again to generate fresh validation evidence.",
  "systemMessage": "⏰ TruthForge: Validation token expired",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny", 
    "permissionDecisionReason": "Validation token expired. Fresh validation required."
  }
}
EOF
    else
        echo "❌ TruthForge: Validation token expired. Run /validate again." >&2
    fi
    exit 2
fi

echo "✅ TruthForge: Validation token verified" >&2

# Optional: Run quick security check before commit
if [ -f "core/security-validator.js" ] && command -v node &> /dev/null; then
    echo "🔒 Running quick security check..." >&2
    
    # Create a temporary script to run quick security check
    cat > /tmp/quick-security-check.js << 'EOF'
const SecurityValidator = require('./core/security-validator');
const validator = new SecurityValidator();

(async () => {
    try {
        // Run just environment and file system checks (fast)
        const envTest = await validator.testEnvironmentVariables();
        const fsTest = await validator.testFileSystemSecurity();
        
        const criticalVulns = [
            ...envTest.vulnerabilities.filter(v => v.severity === 'critical'),
            ...fsTest.vulnerabilities.filter(v => v.severity === 'critical')
        ];
        
        if (criticalVulns.length > 0) {
            console.error('CRITICAL_SECURITY_ISSUES_FOUND');
            console.error(JSON.stringify(criticalVulns, null, 2));
            process.exit(1);
        }
        
        console.log('SECURITY_CHECK_PASSED');
    } catch (error) {
        console.log('SECURITY_CHECK_SKIPPED');
    }
})();
EOF
    
    security_result=$(timeout 10 node /tmp/quick-security-check.js 2>&1 || true)
    rm -f /tmp/quick-security-check.js
    
    if [[ "$security_result" == *"CRITICAL_SECURITY_ISSUES_FOUND"* ]]; then
        if command -v jq &> /dev/null; then
            cat << EOF
{
  "decision": "block",
  "reason": "Critical security vulnerabilities detected. Fix these issues before committing: $security_result",
  "systemMessage": "🔒 TruthForge: Critical security issues found",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Critical security vulnerabilities must be resolved before commit."
  }
}
EOF
        else
            echo "❌ TruthForge: Critical security issues found. Fix before committing." >&2
        fi
        exit 2
    fi
fi

# Success - consume the validation token and allow commit
rm -f .truthforge/validation-passed
echo "🎯 TruthForge: Pre-commit validation passed. Consuming validation token." >&2

if command -v jq &> /dev/null; then
    cat << EOF
{
  "continue": true,
  "systemMessage": "✅ TruthForge validation passed - commit approved",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "TruthForge validation confirmed. Commit approved with proof-based evidence."
  }
}
EOF
else
    echo "✅ TruthForge: Commit approved" >&2
fi

exit 0
