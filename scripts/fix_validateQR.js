const fs = require('fs');
let content = fs.readFileSync('services/backend/src/services/machine.service.ts', 'utf8');
content = content.replace(/import \{ qrService \} from '\.\/qr\.service';\n/g, '');
const startIdx = content.indexOf('  /**\n   * Validates QR token scanned');
if (startIdx !== -1) {
  const endIdx = content.indexOf('async handleDispenseStart');
  if (endIdx !== -1) {
    const chunkToRemove = content.substring(startIdx, endIdx);
    content = content.replace(chunkToRemove, '\n  ');
  }
}
fs.writeFileSync('services/backend/src/services/machine.service.ts', content, 'utf8');
console.log('Fixed');
