import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { hash } from 'bcrypt';
import { Prisma } from '@prisma/client';

// Define types for the structured response
interface ProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  bio: string | null;
  education: any[];
  experience: any[];
  skills: string[];
  links: Record<string, string>;
  [key: string]: any;
}

export async function GET(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    
    // Fetch the user's full profile with all related data
    const user = await db.user.findUnique({
      where: { id: session.user.id },
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
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
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
          orderBy: {
            updatedAt: "desc",
          },
          take: 5,
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
          orderBy: {
            year: "desc",
          },
        },
        educationEntries: {
          orderBy: {
            startDate: "desc",
          },
        },
        experienceEntries: {
          orderBy: {
            startDate: "desc",
          },
        },
        skillEntries: true,
        socialLinks: true,
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Remove sensitive information
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch profile" },
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
    
    let body;
    try {
      body = await req.json();
    } catch (parseError: any) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: 'Invalid request body', details: parseError?.message },
        { status: 400 }
      );
    }
    
    // Extract updatable fields
    const {
      firstName,
      lastName,
      bio,
      education,
      experience,
      skills,
      links,
      profileImage,
      currentPassword,
      newPassword,
      privacyLevel,
      isSetup,
    } = body;
    
    // Log the extracted fields for debugging
    console.log("Profile update request:", {
      userId,
      isSetup,
      hasIsSetup: isSetup !== undefined
    });
    
    
    // Prepare update data for the user model
    const updateData: any = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (privacyLevel) updateData.privacyLevel = privacyLevel;
    if (isSetup !== undefined) updateData.isSetup = isSetup;
    
    console.log("Update data prepared:", updateData);
    
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
    
    // Start a transaction to update everything
    try {
      const result = await db.$transaction(async (tx) => {
        // Update the user basic info
        console.log("Updating user with data:", updateData);
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: updateData,
        });
        console.log("User updated successfully:", {
          id: updatedUser.id,
          isSetup: updatedUser.isSetup
        });
        
        // Handle education entries
        if (education !== undefined) {
          
          // Delete existing education entries
          await tx.education.deleteMany({
            where: { userId },
          });
          
          // Create new education entries
          if (Array.isArray(education) && education.length > 0) {
            await Promise.all(education.map(async (edu) => {
              return tx.education.create({
                data: {
                  userId,
                  school: edu.school,
                  degree: edu.degree,
                  field: edu.field,
                  startDate: new Date(edu.startDate),
                  endDate: edu.endDate ? new Date(edu.endDate) : null,
                },
              });
            }));
          }
        }
        
        // Handle experience entries
        if (experience !== undefined) {
          
          // Delete existing experience entries
          await tx.experience.deleteMany({
            where: { userId },
          });
          
          // Create new experience entries
          if (Array.isArray(experience) && experience.length > 0) {
            await Promise.all(experience.map(async (exp) => {
              return tx.experience.create({
                data: {
                  userId,
                  title: exp.title,
                  company: exp.company,
                  location: exp.location,
                  startDate: new Date(exp.startDate),
                  endDate: exp.endDate ? new Date(exp.endDate) : null,
                  description: exp.description,
                },
              });
            }));
          }
        }
        
        // Handle skills
        if (skills !== undefined) {
          
          // Delete existing skills
          await tx.skill.deleteMany({
            where: { userId },
          });
          
          // Create new skills
          if (Array.isArray(skills) && skills.length > 0) {
            await Promise.all(skills.map(async (skill) => {
              return tx.skill.create({
                data: {
                  userId,
                  name: skill,
                },
              });
            }));
          }
        }
        
        // Handle social links
        if (links !== undefined) {
          
          // Delete existing links
          await tx.socialLink.deleteMany({
            where: { userId },
          });
          
          // Create new links
          if (links && typeof links === 'object') {
            const linkEntries = Object.entries(links);
            if (linkEntries.length > 0) {
              await Promise.all(linkEntries.map(async ([platform, url]) => {
                if (url && typeof url === 'string' && url.trim() !== '') {
                  return tx.socialLink.create({
                    data: {
                      userId,
                      platform,
                      url: url as string,
                    },
                  });
                }
                return null;
              }));
            }
          }
        }
        
        return updatedUser;
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = result;
      
      return NextResponse.json({
        user: userWithoutPassword,
        message: 'Profile updated successfully',
      });
    } catch (txError: any) {
      console.error('Transaction error:', txError);
      return NextResponse.json(
        { 
          error: 'Database transaction failed', 
          details: txError?.message || 'Unknown transaction error',
          code: txError?.code
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error?.message || 'Unknown error',
        code: error?.code
      },
      { status: 500 }
    );
  }
}