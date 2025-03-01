import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcrypt";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string(),
  newPassword: z.string().min(8),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }
    
    const { email, token, newPassword } = validationResult.data;
    
    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }
    
    // Find the reset token
    const resetToken = await db.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        token,
      },
    });
    
    // Check if token exists
    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 400 }
      );
    }
    
    // Check if token has expired
    if (resetToken.expires < new Date()) {
      // Delete expired token
      await db.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      
      return NextResponse.json(
        { success: false, error: "Password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);
    
    // Update user's password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    // Delete the used token
    await db.passwordResetToken.delete({
      where: { id: resetToken.id },
    });
    
    // Also clean up any other expired tokens in the system
    try {
      await db.passwordResetToken.deleteMany({
        where: {
          expires: { lt: new Date() }
        }
      });
    } catch (cleanupError) {
      // Just log the error but don't fail the request
      console.error("Error cleaning up expired tokens:", cleanupError);
    }
    
    return NextResponse.json(
      { success: true, message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in reset-password route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    );
  }
} 