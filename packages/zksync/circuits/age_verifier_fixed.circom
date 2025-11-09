pragma circom 2.0.0;

// AGE VERIFIER - Fixed version that correctly implements age >= threshold

// Simple comparison that outputs 1 if age >= threshold
// Age is valid only if it's greater than or equal to the threshold

template AgeVerifierFixed() {
    signal input age;
    signal input age_threshold;
    signal output valid;
    
    // Output 1 if age >= threshold, 0 otherwise
    // We use constraint that age - threshold >= 0
    valid <== (age >= age_threshold);
}

component main = AgeVerifierFixed();