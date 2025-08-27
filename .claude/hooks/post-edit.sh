#!/bin/bash
# TruthForge Post-Edit Hook
# Automatically validate after significant code changes

# Get input JSON if available
input_json=""
if [ ! -t 0 ]; then
    input_json=$(cat)
fi

# Parse tool information
tool_name=""
file_path=""
if [ -n "$input_json" ] && command -v jq &> /dev/null; then
    tool_name=$(echo "$input_json" | jq -r '.tool_name // ""' 2>/dev/null)
    file_path=$(echo "$input_json" | jq -r '.tool_input.file_path // ""' 2>/dev/null)
fi

# Only validate code files
if [[ "$file_path" =~ \.(js|ts|py|php|java|go|rs|rb|c|cpp|h|hpp)$ ]]; then
    echo "🔍 TruthForge: Code file edited, suggesting validation..." >&2
    
    # Count lines changed (simple heuristic)
    lines_changed=0
    if [ -n "$input_json" ] && command -v jq &> /dev/null; then
        new_content=$(echo "$input_json" | jq -r '.tool_input.new_string // ""' 2>/dev/null)
        if [ -n "$new_content" ]; then
            lines_changed=$(echo "$new_content" | wc -l)
        fi
    fi
    
    # Suggest validation for significant changes
    if [ $lines_changed -gt 10 ]; then
        if command -v jq &> /dev/null; then
            cat << EOF
{
  "systemMessage": "💡 TruthForge: Significant code changes detected. Consider running '/validate' to ensure quality and generate proof-based evidence.",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Code file '$file_path' has been modified with $lines_changed lines. TruthForge recommends validation after significant changes to prevent integration issues."
  }
}
EOF
        else
            echo "💡 TruthForge: Consider running /validate after significant changes" >&2
        fi
    fi
fi

exit 0