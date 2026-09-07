import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getInvitationByToken,
  acceptTeamInvitation,
} from "@/lib/teklifimGelsin/procurementService";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      return NextResponse.json({ error: "Gecersiz veya bulunamayan davet linki." }, { status: 404 });
    }

    if (invitation.status === "expired") {
      return NextResponse.json(
        { error: "Bu davet baglantisinin gecerlilik suresi dolmustur.", invitation },
        { status: 410 }
      );
    }

    if (invitation.status === "accepted") {
      return NextResponse.json(
        { error: "Bu davet daha once kabul edilmistir.", invitation },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      businessName: invitation.businessName,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    });
  } catch (err: any) {
    console.error("Verify invitation token error:", err);
    return NextResponse.json({ error: "Davet bilgisi dogrulanamadi." }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen once giris yapin." }, { status: 401 });
    }

    const member = await acceptTeamInvitation(token, {
      uid: user.uid,
      email: user.email,
      name: user.email.split("@")[0],
    });

    return NextResponse.json({
      success: true,
      member,
      message: "Ekibe basariyla katildiniz.",
    });
  } catch (err: any) {
    console.error("Accept team invitation error:", err);
    return NextResponse.json(
      { error: err.message || "Davet kabul edilemedi." },
      { status: 400 }
    );
  }
}
