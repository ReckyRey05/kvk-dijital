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
      console.log('zoho.com failed, trying zoho.eu...', e.message);
      
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
        console.log('zoho.eu also failed.', e2.message);
      }
    }

    return NextResponse.json(
      { error: errorObj?.message || 'Mesaj gönderilirken bir hata oluştu.' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: error.message || 'Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
}
