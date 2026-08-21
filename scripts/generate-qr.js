const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

async function generateQRCodes() {
  const outputDir = path.join(__dirname, '..', 'public', 'restaurant');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const targetUrl = 'https://kvkdijitalcozumler.com/qr/aura-bistro/m-4';
  const outputPath = path.join(outputDir, 'qr-masa-4.png');

  await QRCode.toFile(outputPath, targetUrl, {
    width: 600,
    margin: 3,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'H'
  });

  console.log(`Generated QR Code for Masa 4 at: ${outputPath}`);
  console.log(`Target URL: ${targetUrl}`);
}

generateQRCodes().catch(console.error);
