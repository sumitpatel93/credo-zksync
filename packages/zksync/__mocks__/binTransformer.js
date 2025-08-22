const fs = require('fs');
const path = require('path');

module.exports = {
  process(sourceText, sourcePath, options) {
    const buffer = fs.readFileSync(sourcePath);
    // Convert binary to hex string with 0x prefix
    const hexString = '0x' + buffer.toString('hex');
    return {
      code: `module.exports = ${JSON.stringify(hexString)};`,
    };
  },
};