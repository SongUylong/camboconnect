import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return NextResponse.json(
        { success: true, message: "If your email is registered, you will receive a password reset link" },
        { status: 200 }
      );
    }

    // Generate a reset token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save the token in the database
    await db.passwordResetToken.upsert({
      where: { userId: user.id },
      update: {
        token,
        expires,
      },
      create: {
        userId: user.id,
        token,
        expires,
      },
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email with reset link
    await sendEmail({
      to: email,
      subject: "Reset your CamboConnect password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4f46e5;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .button {
              display: inline-block;
              background-color: #4f46e5;
              color: white !important;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #6b7280;
            }
            .note {
              font-size: 14px;
              color: #6b7280;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
             a, a:hover, a:focus, a:active {
                text-decoration: none;
                color: inherit;
                }
            a.button {
                color: white !important;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CamboConnect</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>Hello${user.firstName ? ` ${user.firstName}` : ''},</p>
              <p>We received a request to reset your password for your CamboConnect account. Click the button below to create a new password. This link will expire in 1 hour.</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button" style="color: white !important;">Reset Password</a>
              </div>
              <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              <div class="note">
                <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
                <p style="word-break: break-all;">${resetUrl}</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} CamboConnect. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Password reset link sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in forgot-password route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}
