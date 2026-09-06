import { NextResponse } from "next/server";
import { getRequestDetails } from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request, props: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await props.params;
    const request = await getRequestDetails(requestId);

    if (!request) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ request });
  } catch (err: any) {
    console.error("Teklifim GET request details error:", err);
    return NextResponse.json({ error: "Talep detayları alınırken hata oluştu." }, { status: 500 });
  }
}
