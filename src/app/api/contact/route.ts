import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getAdminDb } from '@/lib/firebase/admin';
import { RATE_LIMITS } from '@/config/rateLimit';
import { getClientIp, checkRateLimit, createRateLimitResponse } from '@/lib/security/rateLimit';
import { validateContactInput } from '@/lib/validation/schemas';
import { createSecureServerErrorResponse } from '@/lib/security/errorResponse';

export async function POST(request: Request) {
  try {
    // 1. IP-based Rate Limit Check (3 requests / 15 minutes)
    const clientIp = getClientIp(request);
    const ipCheck = checkRateLimit(`contact:ip:${clientIp}`, RATE_LIMITS.contact.ip);
    if (!ipCheck.allowed) {
      return createRateLimitResponse(ipCheck);
    }

    const rawBody = await request.json().catch(() => ({}));
    const validation = validateContactInput(rawBody);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error || 'Gönderilen form verisi geçersiz.' },
        { status: 400 }
      );
    }

    const { name, email, phone, service, subject, message } = validation.data;

    // 2. Email-based Rate Limit Check (3 requests / 15 minutes)
    const emailCheck = checkRateLimit(`contact:email:${email}`, RATE_LIMITS.contact.email);
    if (!emailCheck.allowed) {
      return createRateLimitResponse(emailCheck);
    }

    // Save to Firestore via Firebase Admin SDK in server route
    try {
      const db = getAdminDb();
      await db.collection("contactMessages").add({
        name,
        email,
        phone: phone || "",
        service: service || "Web Tasarım",
        message,
        status: "new",
        createdAt: new Date()
      });
    } catch (dbErr) {
      console.error("Firestore Admin save notice:", dbErr);
    }

    // Zoho SMTP configuration
    // Şifre güvenliği için process.env üzerinden alacağız. Vercel paneline eklenecek.
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Yeni İletişim Formu Mesajı: ${subject || 'Konu Belirtilmedi'}`,
      text: `İsim: ${name}\nE-posta: ${email}\nKonu: ${subject}\n\nMesaj:\n${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0070f3;">Yeni İletişim Formu Mesajı</h2>
          <p><strong>İsim:</strong> ${name}</p>
          <p><strong>E-posta:</strong> ${email}</p>
          <p><strong>Konu:</strong> ${subject}</p>
          <hr />
          <h3>Mesaj:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    };

    let errorObj: any = null;

    // Try zoho.com first
    try {
      const transporterCom = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, 
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      await transporterCom.sendMail(mailOptions);
      return NextResponse.json({ success: true, message: 'Mesaj başarıyla gönderildi.' });
    } catch (e: any) {
      errorObj = e;
      console.warn("SMTP zoho.com primary server connection failed, attempting fallback to zoho.eu");
      
      // If zoho.com fails, try zoho.eu
      try {
        const transporterEu = nodemailer.createTransport({
          host: 'smtp.zoho.eu',
          port: 465,
          secure: true, 
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporterEu.sendMail(mailOptions);
        return NextResponse.json({ success: true, message: 'Mesaj başarıyla gönderildi.' });
      } catch (e2: any) {
        errorObj = e2;
        console.warn("SMTP zoho.eu secondary server connection also failed.");
      }
    }

    return createSecureServerErrorResponse('ContactSMTP', errorObj, 'Mesaj gönderilirken bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
  } catch (error: any) {
    return createSecureServerErrorResponse('ContactHandler', error, 'Mesaj gönderilirken bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
  }
}
