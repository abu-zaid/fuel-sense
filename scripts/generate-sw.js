const fs = require('fs');
const path = require('path');

// Generate version based on timestamp
const VERSION = `1.0.${Date.now()}`;

// Read the template service worker
const templatePath = path.join(__dirname, '..', 'public', 'sw-template.js');
const outputPath = path.join(__dirname, '..', 'public', 'sw.js');

let swContent = fs.readFileSync(templatePath, 'utf8');

// Replace the VERSION placeholder
swContent = swContent.replace('__VERSION__', VERSION);

// Write the generated service worker
fs.writeFileSync(outputPath, swContent, 'utf8');

console.log(`✅ Generated service worker with version: ${VERSION}`);
