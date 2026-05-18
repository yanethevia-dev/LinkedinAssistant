// Simple placeholder icon generator
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const color = '#0A66C2';

sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size/8}" fill="${color}"/>
  <text x="${size/2}" y="${size * 0.7}" font-size="${size * 0.5}" fill="white" text-anchor="middle" font-weight="bold" font-family="Arial">LA</text>
</svg>`;

  fs.writeFileSync(
    path.join(__dirname, `src/assets/icons/icon-${size}.svg`),
    svg
  );
  console.log(`Created icon-${size}.svg`);
});

// For now, just copy SVG as PNG (browsers will handle it)
// In production, use proper PNG conversion
sizes.forEach(size => {
  const svgPath = path.join(__dirname, `src/assets/icons/icon-${size}.svg`);
  const pngPath = path.join(__dirname, `src/assets/icons/icon-${size}.png`);

  // Create a minimal 1x1 PNG as placeholder
  const minimalPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync(pngPath, minimalPNG);
  console.log(`Created placeholder icon-${size}.png`);
});

console.log('\nNote: PNGs are minimal placeholders. Use SVGs for now or convert properly before release.');
