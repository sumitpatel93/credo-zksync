pragma circom 2.0.0;

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;

    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0;
        lc1 += out[i] * (2**i);
    }

    lc1 === in;
}

template LessThan(n) {
    signal input in[2];
    signal output out;
    
    assert(n <= 252);
    
    component num2bits = Num2Bits(n+1);
    num2bits.in <== in[0] + (1 << n) - in[1];
    out <== 1 - num2bits.out[n];
}

template GreaterEqThan(n) {
    signal input in[2];
    signal output out;
    
    component lt = LessThan(n);
    lt.in[0] <== in[1];
    lt.in[1] <== in[0];
    out <== 1 - lt.out;
}

template AgeVerifier() {
    signal input age;
    signal input age_threshold;
    signal output valid;
    
    component geq = GreaterEqThan(32);
    geq.in[0] <== age;
    geq.in[1] <== age_threshold;
    
    valid <== geq.out;
}

component main = AgeVerifier();