const path = require('path');
const fs = require('fs');

// Test the paths that the adapter uses
const wasmPath = path.join(__dirname, '../../build/age_verifier.wasm');
const provingKeyPath = path.join(__dirname, '../../build/proving_key.zkey');

console.log('Testing adapter paths...');
console.log('WASM path:', wasmPath);
console.log('Proving key path:', provingKeyPath);
console.log('');
console.log('WASM file exists:', fs.existsSync(wasmPath));
console.log('Proving key file exists:', fs.existsSync(provingKeyPath));
console.log('');
console.log('Proving key file size:', fs.statSync(provingKeyPath).size, 'bytes');
console.log('WASM file size:', fs.statSync(wasmPath).size, 'bytes');