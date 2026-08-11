import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'İsim, e-posta ve mesaj alanları zorunludur.' },
        { status: 400 }
      );
    }

    // Zoho SMTP configuration
    // Şifre güvenliği için process.env üzerinden alacağız. Vercel paneline eklenecek.
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // e.g., iletisim@kvkdijitalcozumler.com
        pass: process.env.EMAIL_PASS, // Uygulama parolası veya normal şifre
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Zoho requires the "from" to match the authenticated user
      to: process.env.EMAIL_USER, // Bize gelecek
      replyTo: email,
      subject: `Yeni İletişim Formu Mesajı: ${subject || 'Konu Belirtilmedi'}`,
      text: `
İsim: ${name}
E-posta: ${email}
Konu: ${subject}

Mesaj:
${message}
      `,
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

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Mesaj başarıyla gönderildi.' });
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
}
