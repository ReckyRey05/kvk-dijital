import QRCode from "qrcode";
import path from "path";

const artifactDir = "C:\\Users\\ali_h\\.gemini\\antigravity\\brain\\57eda34f-a6ac-4e58-868a-4182e7ef36ad";

async function generateQRs() {
  const qrData = [
    {
      name: "qr-masa-4.png",
      url: "https://kvkdijitalcozumler.com/qr/aura-bistro/m-4",
    },
    {
      name: "qr-masa-1.png",
      url: "https://kvkdijitalcozumler.com/qr/aura-bistro/m-1",
    },
    {
      name: "qr-masa-2.png",
      url: "https://kvkdijitalcozumler.com/qr/aura-bistro/m-2",
    },
  ];

  for (const item of qrData) {
    const target = path.join(artifactDir, item.name);
    await QRCode.toFile(target, item.url, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    console.log(`Generated QR: ${target} -> ${item.url}`);
  }
}

generateQRs().catch(console.error);
