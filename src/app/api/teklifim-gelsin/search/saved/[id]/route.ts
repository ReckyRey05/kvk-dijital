import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { deleteUserSavedSearch } from "@/lib/teklifimGelsin/searchService";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Arama ID'si belirtilmelidir." }, { status: 400 });
    }

    await deleteUserSavedSearch(user.uid, id);

    return NextResponse.json({
      success: true,
      message: "Kayıtlı arama başarıyla silindi.",
    });
  } catch (err: any) {
    console.error("DELETE /api/teklifim-gelsin/search/saved/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Kayıtlı arama silinemedi." },
      { status: 500 }
    );
  }
}
