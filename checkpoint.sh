#!/bin/bash
# TruthForge Checkpoint System

checkpoint_name=$1
validation_proof=${2:-"Manual checkpoint"}

if [ -z "$checkpoint_name" ]; then
    echo "Usage: ./checkpoint.sh 'Checkpoint name' 'Optional validation proof'"
    exit 1
fi

# Check if validation passed
if [ -f ".truthforge/validation-passed" ]; then
    # Create checkpoint commit
    git add -A
    git commit -m "🔒 CHECKPOINT: $checkpoint_name

Validation Proof: $validation_proof
Validated by: TruthForge proof-validator
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Framework: TruthForge v1.0.0"
    
    echo "✅ Checkpoint created: $checkpoint_name"
    
    # Consume validation token
    rm .truthforge/validation-passed
    
    # Update checkpoint log
    echo "$(date -u +"%Y-%m-%d %H:%M:%S UTC") - $checkpoint_name - $validation_proof" >> .truthforge/checkpoint-log.txt
    
else
    echo "❌ Cannot create checkpoint: Validation required"
    echo "   Run /validate command first to prove everything works"
    exit 1
fi
