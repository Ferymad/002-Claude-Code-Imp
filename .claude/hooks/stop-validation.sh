#!/bin/bash
# TruthForge Stop Hook
# Ensures validation is complete before stopping

# Get input JSON if available
input_json=""
if [ ! -t 0 ]; then
    input_json=$(cat)
fi

# Check if stop hook is already active to prevent loops
stop_hook_active=""
if [ -n "$input_json" ] && command -v jq &> /dev/null; then
    stop_hook_active=$(echo "$input_json" | jq -r '.stop_hook_active // ""' 2>/dev/null)
fi

# Avoid infinite loops
if [ "$stop_hook_active" = "true" ]; then
    exit 0
fi

# Check if there are unvalidated changes
if [ -d ".git" ]; then
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        # Check if validation token exists
        if [ ! -f ".truthforge/validation-passed" ]; then
            echo "⚠️ TruthForge: Uncommitted changes detected without validation" >&2
            
            if command -v jq &> /dev/null; then
                cat << EOF
{
  "decision": "block",
  "reason": "You have uncommitted code changes that haven't been validated. This could lead to issues later. Run '/validate' to generate proof-based evidence, then commit your changes, or use '/checkpoint' to create a validated checkpoint.",
  "systemMessage": "🚨 TruthForge: Unvalidated changes detected"
}
EOF
            else
                echo "🚨 TruthForge: Run /validate before stopping with uncommitted changes" >&2
            fi
            exit 0
        fi
    fi
fi

# Check if any critical processes are running that should be validated
if command -v pgrep &> /dev/null; then
    critical_processes=$(pgrep -f "node|python|npm|pip" 2>/dev/null | wc -l)
    if [ $critical_processes -gt 2 ]; then
        echo "🔍 TruthForge: Development processes still running" >&2
        
        if command -v jq &> /dev/null; then
            cat << EOF
{
  "systemMessage": "💡 TruthForge: Multiple development processes detected. Consider validating current state before stopping."
}
EOF
        fi
    fi
fi

exit 0