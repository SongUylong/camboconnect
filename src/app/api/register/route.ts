import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { db } from '@/lib/prisma';
import { z } from 'zod';

// Schema validation for registration
const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  privacyLevel: z.enum(["PUBLIC", "FRIENDS_ONLY", "ONLY_ME"]).default("ONLY_ME"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, privacyLevel } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        privacyLevel,
      },
    });

    // Return the created user (without password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(
      { user: userWithoutPassword, message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}