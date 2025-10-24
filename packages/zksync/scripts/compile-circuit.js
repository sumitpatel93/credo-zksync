const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function compileCircuit() {
  console.log('Compiling age verification circuit...');
  
  try {
    // Create build directory
    const buildDir = path.join(__dirname, '../build');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    
    // Try using circom2 to compile the circuit
    try {
      execSync('npx circom2 ./circuits/age_verifier.circom --r1cs --wasm --sym -o ./build/', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
    } catch (circom2Error) {
      console.log('Circom2 compilation failed, trying snarkjs...');
      // Try using snarkjs to compile the circuit
      try {
        execSync('npx snarkjs circom ./circuits/age_verifier.circom --r1cs --wasm --sym -o ./build/', { 
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
      } catch (snarkjsError) {
        console.log('SnarkJS compilation failed, trying global circom...');
        // Fallback to global circom
        execSync('circom ./circuits/age_verifier.circom --r1cs --wasm --sym --output ./build', { 
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
      }
    }
    
    console.log('Circuit compiled successfully!');
    console.log('Files generated:');
    console.log('- age_verifier.r1cs');
    console.log('- age_verifier.wasm');
    console.log('- age_verifier.sym');
    
  } catch (error) {
    console.error('Error compiling circuit:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  compileCircuit();
}

module.exports = { compileCircuit };