import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function GET(req: Request) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users with application counts
    const users = await db.user.findMany({
      include: {
        _count: {
          select: {
            applications: true,
            followedOrgs: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response to match UI expectations
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      role: user.isAdmin ? "ADMIN" : "USER", // Convert isAdmin to role format expected by UI
      status: "ACTIVE", // Default status as your schema doesn't have this field
      emailVerified: false, // Placeholder as your schema doesn't have this field
      createdAt: user.createdAt,
      lastLogin: undefined, // Your schema doesn't have this field
      image: user.profileImage,
      organizationCount: user._count.followedOrgs,
      applicationCount: user._count.applications
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request body
    const { name, email, password, role } = await req.json();

    // Validate the request body
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if the user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    // Split the full name into firstName and lastName
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        isAdmin: role === "ADMIN", // Convert role to isAdmin
        privacyLevel: "ONLY_ME", // Default privacy level
        educationPrivacy: "ONLY_ME",
        experiencePrivacy: "ONLY_ME",
        skillsPrivacy: "ONLY_ME",
        contactUrlPrivacy: "ONLY_ME",
        isSetup: false
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        profileImage: true
      }
    });

    // Return the created user
    return NextResponse.json({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      role: user.isAdmin ? "ADMIN" : "USER", // Convert isAdmin to role format expected by UI
      status: "ACTIVE", // Default status as your schema doesn't have this field
      emailVerified: false, // Placeholder as your schema doesn't have this field
      createdAt: user.createdAt,
      image: user.profileImage,
      organizationCount: 0, 
      applicationCount: 0
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}