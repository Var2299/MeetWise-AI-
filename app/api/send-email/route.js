import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { recipients, summary, subject } = await request.json();

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient is required' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipients.join(', '),
      subject: subject || 'Shared Summary',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0284c7; margin-bottom: 20px;">Summary Shared With You</h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #0284c7;">
            <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${summary}</pre>
          </div>
          <p style="color: #64748b; margin-top: 20px; font-size: 14px;">
            This summary was generated and shared via AI-Powered Summary Workspace
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
