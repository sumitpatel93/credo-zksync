const fs = require('fs');
const path = require('path');

console.log('Checking compiled circuit files...');

const buildDir = path.join(__dirname, '../../build');
const wasmFile = path.join(buildDir, 'age_verifier.wasm');
const r1csFile = path.join(buildDir, 'age_verifier.r1cs');

console.log('WASM file exists:', fs.existsSync(wasmFile));
console.log('R1CS file exists:', fs.existsSync(r1csFile));

if (fs.existsSync(wasmFile)) {
  const stats = fs.statSync(wasmFile);
  console.log('WASM file size:', stats.size, 'bytes');
}

if (fs.existsSync(r1csFile)) {
  const stats = fs.statSync(r1csFile);
  console.log('R1CS file size:', stats.size, 'bytes');
}

// Check if there's a JS wrapper
const jsFile = path.join(buildDir, 'age_verifier_js/witness_calculator.js');
console.log('JS wrapper exists:', fs.existsSync(jsFile));

if (fs.existsSync(jsFile)) {
  console.log('\nCircuit compiled successfully!');
  console.log('Files ready for testing:');
  console.log('- age_verifier.wasm');
  console.log('- age_verifier.r1cs');
  console.log('- witness_calculator.js');
}