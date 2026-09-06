import QRCode from "qrcode";

/**
 * Generate unambiguous, uppercase 6-character tag code
 * Excludes confusing characters: 0, O, 1, I, L
 */
export function generateTagCode(length: number = 6): string {
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate QR code as Base64 Data URL
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 400,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}

/**
 * Generate QR code as SVG string
 */
export async function generateQrSvg(text: string): Promise<string> {
  return await QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 1,
    width: 300,
  });
}
