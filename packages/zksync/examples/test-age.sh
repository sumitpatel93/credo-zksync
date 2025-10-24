#!/bin/bash

# Quick test script for AnonCreds to on-chain age verification

echo "🚀 AnonCreds Age Proof Quick Test"
echo ""

# Check if age and threshold are provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 [age] [threshold]"
    echo "Example: $0 25 18"
    echo ""
    echo "Running default test (age 25, threshold 18)..."
    node cli/test-age-proof-simple.js generate
elif [ $# -eq 1 ]; then
    echo "Testing age $1 with default threshold 18..."
    node cli/test-age-proof-simple.js generate $1
else
    echo "Testing age $1 with threshold $2..."
    node cli/test-age-proof-simple.js generate $1 $2
fi

echo ""
echo "✅ Test complete! The proof is ready for on-chain verification."""}