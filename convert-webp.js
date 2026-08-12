const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGOS_DIR = path.join(__dirname, 'public', 'logos');

async function convertToWebP(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;

  const outPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  const meta = await sharp(filePath).metadata();
  
  await sharp(filePath)
    .webp({ quality: 90, lossless: false })
    .toFile(outPath);

  const inSize = fs.statSync(filePath).size;
  const outSize = fs.statSync(outPath).size;
  const saving = ((1 - outSize / inSize) * 100).toFixed(1);
  console.log(`✓ ${path.basename(filePath)} → ${path.basename(outPath)} | ${(inSize/1024).toFixed(1)}KB → ${(outSize/1024).toFixed(1)}KB (${saving}% küçüldü) | ${meta.width}x${meta.height}`);
}

async function main() {
  const files = fs.readdirSync(LOGOS_DIR);
  console.log(`\n🔄 ${LOGOS_DIR} içindeki görseller WebP'ye dönüştürülüyor...\n`);
  for (const file of files) {
    const full = path.join(LOGOS_DIR, file);
    await convertToWebP(full);
  }
  console.log('\n✅ Tüm dönüşümler tamamlandı!');
}

main().catch(console.error);
