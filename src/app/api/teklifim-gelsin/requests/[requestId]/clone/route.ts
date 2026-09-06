import { NextResponse } from "next/server";
import { getCloneableRequestData } from "@/lib/teklifimGelsin/teklifimService";

export async function GET(
  req: Request,
  props: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await props.params;
    const cloneData = await getCloneableRequestData(requestId);

    if (!cloneData) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, cloneData });
  } catch (err: any) {
    console.error("Teklifim GET clone data error:", err);
    return NextResponse.json({ error: "Talep verileri kopyalanamadı." }, { status: 500 });
  }
}
