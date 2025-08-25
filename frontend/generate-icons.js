const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgContent = fs.readFileSync(path.join(__dirname, 'public', 'poker-icon.svg'));

// Generate PNG files
async function generateIcons() {
  try {
    // Generate 192x192 PNG
    await sharp(svgContent)
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, 'public', 'logo192.png'));
    console.log('Generated logo192.png');

    // Generate 512x512 PNG
    await sharp(svgContent)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, 'public', 'logo512.png'));
    console.log('Generated logo512.png');

    // Generate a 32x32 PNG as favicon.ico alternative
    // Most modern browsers support PNG favicons
    await sharp(svgContent)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon.png'));
    console.log('Generated favicon.png');
    
    // Also generate a 64x64 for better quality
    await sharp(svgContent)
      .resize(64, 64)
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon-64.png'));
    console.log('Generated favicon-64.png');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();