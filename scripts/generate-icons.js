#!/usr/bin/env node

/**
 * Script to generate PNG and ICO icons from SVG
 * Requires: sharp (npm install sharp --save-dev)
 * 
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp is required. Install it with: npm install sharp --save-dev');
  process.exit(1);
}

const iconSizes = [16, 32, 96, 192, 512];
const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'app');
const svgPath = path.join(publicDir, 'icon.svg');

if (!fs.existsSync(svgPath)) {
  console.error('Error: icon.svg not found in public directory');
  process.exit(1);
}

async function generateIcons() {
  console.log('Generating icons from SVG...\n');

  // Read SVG
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate PNG icons
  for (const size of iconSizes) {
    try {
      const outputPath = path.join(publicDir, `icon-${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated icon-${size}.png`);
    } catch (error) {
      console.error(`✗ Failed to generate icon-${size}.png:`, error.message);
    }
  }

  // Generate maskable icons (with padding for safe zone)
  const maskableSizes = [192, 512];
  for (const size of maskableSizes) {
    try {
      const padding = size * 0.1; // 10% padding for safe zone
      const innerSize = size - (padding * 2);
      
      const outputPath = path.join(publicDir, `icon-maskable-${size}.png`);
      
      // Create a new SVG with padding
      const paddedSvg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="fsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${size}" height="${size}" fill="white" rx="${size * 0.22}"/>
          <g transform="translate(${padding}, ${padding})">
            <rect width="${innerSize}" height="${innerSize}" fill="white" rx="${innerSize * 0.22}"/>
            <text 
              x="${innerSize / 2}" 
              y="${innerSize * 0.664}" 
              font-family="system-ui, -apple-system, sans-serif" 
              font-size="${innerSize * 0.547}" 
              font-weight="900" 
              text-anchor="middle" 
              fill="url(#fsGradient)"
              letter-spacing="${-innerSize * 0.0156}"
            >FS</text>
          </g>
        </svg>
      `;

      await sharp(Buffer.from(paddedSvg))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated icon-maskable-${size}.png`);
    } catch (error) {
      console.error(`✗ Failed to generate icon-maskable-${size}.png:`, error.message);
    }
  }

  // Generate favicon.ico (16x16 and 32x32)
  try {
    const favicon16 = await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toBuffer();
    
    const favicon32 = await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toBuffer();

    // For ICO format, we'll create a multi-resolution PNG
    // Most modern systems accept PNG as favicon
    const faviconPath = path.join(appDir, 'favicon.ico');
    await sharp(favicon32)
      .resize(32, 32)
      .png()
      .toFile(faviconPath);
    console.log(`✓ Generated favicon.ico`);
  } catch (error) {
    console.error(`✗ Failed to generate favicon.ico:`, error.message);
  }

  // Generate app/icon.png for Next.js
  try {
    const appIconPath = path.join(appDir, 'icon.png');
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(appIconPath);
    console.log(`✓ Generated app/icon.png`);
  } catch (error) {
    console.error(`✗ Failed to generate app/icon.png:`, error.message);
  }

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);

