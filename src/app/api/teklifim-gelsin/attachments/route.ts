import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Yüklenecek dosya bulunamadı." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Dosya boyutu 10MB sınırını aşamaz." },
        { status: 400 }
      );
    }

    const fileType = file.type || "application/octet-stream";
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return NextResponse.json(
        {
          error:
            "Desteklenmeyen dosya türü. Yalnızca PDF, Word, Excel, CSV ve resim formatları (PNG, JPG, WEBP) yüklenebilir.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${fileType};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      attachment: {
        url: dataUrl,
        name: file.name,
        size: file.size,
        type: fileType,
      },
    });
  } catch (err: any) {
    console.error("Attachment upload error:", err);
    return NextResponse.json(
      { error: err.message || "Dosya yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
