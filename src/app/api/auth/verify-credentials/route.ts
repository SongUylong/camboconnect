import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { compare } from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, password } = data;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      // Return generic error to prevent email enumeration
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 400 }
      );
    }

    // Verify password
    const passwordValid = await compare(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 400 }
      );
    }

    // If we get here, credentials are valid
    return NextResponse.json({
      success: true,
      message: "Credentials verified",
    });
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 