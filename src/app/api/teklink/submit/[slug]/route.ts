import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { submitPublicFormResponse, getPublicFormBySlug } from "@/lib/teklink/teklinkService";
import { getAdminDb } from "@/lib/firebase/admin";

export async function POST(req: Request, props: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await props.params;
    if (!slug) {
      return NextResponse.json({ error: "Geçersiz form bağlantısı." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { answers, files } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Lütfen form alanlarını doldurun." }, { status: 400 });
    }

    const result = await submitPublicFormResponse(slug, answers, files);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Form gönderilemedi." }, { status: 400 });
    }

    // Optional asynchronous business email notification
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const db = getAdminDb();
        const formSnap = await db.collection("teklink_forms").where("slug", "==", slug).limit(1).get();
        if (!formSnap.empty) {
          const formDoc = formSnap.docs[0].data();
          const tenantId = formDoc.tenantId;
          const tenantDoc = await db.collection("teklink_tenants").doc(tenantId).get();
          const tenantEmail = tenantDoc.data()?.email;

          if (tenantEmail) {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            const mailHtml = `
              <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px;">
                <h2 style="color: #0f172a; margin-bottom: 8px;">Yeni Form Cevabı Alındı</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 0;">
                  <strong>${formDoc.title}</strong> formunuz için yeni bir müşteri yanıtı geldi.
                </p>
                <div style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://kvkdijitalcozumler.com'}/teklink/dashboard" 
                     style="display: inline-block; background: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                    Cevapları Panelde Gör
                  </a>
                </div>
              </div>
            `;

            transporter.sendMail({
              from: `"TekLink Bildirim" <${process.env.EMAIL_USER}>`,
              to: tenantEmail,
              subject: `Yeni Form Cevabı: ${formDoc.title}`,
              html: mailHtml,
            }).catch(() => {});
          }
        }
      }
    } catch {
      // Notification is non-blocking
    }

    return NextResponse.json({ success: true, submissionId: result.submissionId });
  } catch (err: any) {
    console.error("TekLink submit error:", err);
    return NextResponse.json({ error: "Form iletilirken bir hata meydana geldi." }, { status: 500 });
  }
}
