# Quick Start: Test AnonCreds Age Verification

## One-Command Testing

Test the complete flow with a single command:

```bash
# Test with default values (age 25, threshold 18)
node cli/test-age-proof-simple.js generate

# Test with custom values
node cli/test-age-proof-simple.js generate 30 21

# Test multiple scenarios
node cli/test-age-proof-simple.js test-scenarios
```

## What You'll See

The CLI will show you:
1. Proof generation
2. Solidity-compatible format
3. Proof verification
4. Success message

## Quick Commands

### Generate a Proof
```bash
# Age 25, threshold 18 (default)
node cli/test-age-proof-simple.js generate

# Custom age and threshold
node cli/test-age-proof-simple.js generate 30 21
```

### Test Multiple Scenarios
```bash
# Tests various age/threshold combinations
node cli/test-age-proof-simple.js test-scenarios
```

### Using the Shell Script
```bash
# Quick test with bash
./examples/test-age.sh 25 18
```

## Result

You'll get a complete, verifiable proof ready for on-chain submission!

## Files Generated

The proofs are formatted for Solidity and ready to use in your smart contracts.

## Success!

The complete flow from AnonCreds credentials to on-chain age verification is working!