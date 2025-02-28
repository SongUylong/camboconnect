import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { hash } from 'bcrypt';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Fetch user profile with related data
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        bookmarks: {
          include: {
            opportunity: {
              include: {
                organization: true,
                category: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        applications: {
          include: {
            opportunity: {
              include: {
                organization: true,
                category: true,
              },
            },
            status: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        participations: {
          include: {
            opportunity: {
              include: {
                organization: true,
                category: true,
              },
            },
          },
          orderBy: { year: 'desc' },
        },
        _count: {
          select: {
            bookmarks: true,
            applications: true,
            participations: true,
            friendsOf: true,
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await req.json();
    
    // Extract updatable fields
    const {
      firstName,
      lastName,
      bio,
      education,
      skills,
      profileImage,
      currentPassword,
      newPassword,
      privacyLevel,
    } = body;
    
    // Prepare update data
    const updateData: any = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (education !== undefined) updateData.education = education;
    if (skills !== undefined) updateData.skills = skills;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (privacyLevel) updateData.privacyLevel = privacyLevel;
    
    // Handle password change if requested
    if (newPassword && currentPassword) {
      // Get current user with password
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });
      
      if (!user || !user.password) {
        return NextResponse.json(
          { error: 'User not found or no password set' },
          { status: 404 }
        );
      }
      
      // Verify current password
      const bcrypt = require('bcrypt');
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      
      // Hash new password
      updateData.password = await hash(newPassword, 10);
    }
    
    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}