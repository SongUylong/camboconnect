import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import { NextAuthOptions } from "next-auth";
import { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import { verifyJwtToken } from "@/lib/jwt";

// Create a custom adapter that properly handles our User model requirements
function CustomAdapter(prisma: PrismaClient): Adapter {
  // Get the default adapter
  const defaultAdapter = PrismaAdapter(prisma);
  
  // Return a modified adapter with our custom createUser function
  return {
    ...defaultAdapter,
    createUser: async (user: {
      email: string;
      emailVerified?: Date | null;
      name?: string | null;
      image?: string | null;
    }): Promise<AdapterUser> => {
      // Extract first and last name from the name field
      const nameParts = user.name?.split(' ') || ['', ''];
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Create the user with our required fields
      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: user.email,
          profileImage: user.image,
          privacyLevel: "ONLY_ME",
        },
      });
      
      // Return the user in the format expected by NextAuth
      return {
        id: newUser.id,
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        emailVerified: null,
        image: newUser.profileImage,
      };
    }
  };
}

export const authOptions: NextAuthOptions = {
  adapter: CustomAdapter(db as PrismaClient),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorVerified: { label: "2FA Verified", type: "text" },
        twoFactorToken: { label: "2FA Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        // Check if this is a 2FA verification
        if (credentials.twoFactorVerified === "true" && credentials.twoFactorToken) {
          // Verify the 2FA token
          const decoded = verifyJwtToken(credentials.twoFactorToken);
          
          if (!decoded || decoded.email !== credentials.email || !decoded.twoFactorVerified) {
            return null;
          }
          
          // If token is valid, get the user
          const user = await db.user.findUnique({
            where: {
              email: credentials.email,
            },
          });
          
          if (!user) {
            return null;
          }
          
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            isAdmin: user.isAdmin,
          };
        }

        // Regular password login
        if (!credentials.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordValid = await compare(credentials.password, user.password);

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.isAdmin = token.isAdmin as boolean;
        
        // Ensure the image URL is properly formatted
        if (token.picture) {
          session.user.image = token.picture as string;
        } else {
          session.user.image = null;
        }
      }

      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // For Google provider
        if (account.provider === "google") {
          // Check if user already exists in the database
          const existingUser = await db.user.findFirst({
            where: {
              email: user.email ? user.email : undefined,
            },
          });

          if (existingUser) {
            // User exists, update token
            // If this is a Google sign-in, update the profile image
            if (account.access_token) {
              try {
                const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                  headers: {
                    Authorization: `Bearer ${account.access_token}`,
                  },
                });
                
                if (response.ok) {
                  const googleProfile = await response.json();
                  
                  // Update the user's profile image if Google has one
                  if (googleProfile.picture) {
                    await db.user.update({
                      where: { id: existingUser.id },
                      data: { profileImage: googleProfile.picture },
                    });
                    
                    // Add picture to token
                    token.picture = googleProfile.picture;
                  }
                }
              } catch (error) {
                console.error('Error fetching Google profile:', error);
              }
            }
            
            return {
              id: existingUser.id,
              name: `${existingUser.firstName} ${existingUser.lastName}`,
              email: existingUser.email,
              isAdmin: existingUser.isAdmin,
              picture: existingUser.profileImage,
            };
          } else {
            // Create new user from Google data
            const names = user.name?.split(' ') || ['', ''];
            const firstName = names[0];
            const lastName = names.length > 1 ? names.slice(1).join(' ') : '';
            
            // Try to get profile image from Google
            let profileImage = null;
            if (account.access_token) {
              try {
                const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                  headers: {
                    Authorization: `Bearer ${account.access_token}`,
                  },
                });
                
                if (response.ok) {
                  const googleProfile = await response.json();
                  profileImage = googleProfile.picture || null;
                }
              } catch (error) {
                console.error('Error fetching Google profile:', error);
              }
            }
            
            const newUser = await db.user.create({
              data: {
                email: user.email!,
                firstName,
                lastName,
                isAdmin: false,
                profileImage,
              },
            });
            
            return {
              id: newUser.id,
              name: user.name,
              email: newUser.email,
              isAdmin: newUser.isAdmin,
              picture: profileImage,
            };
          }
        }
        
        // For credentials provider
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: (user as any).isAdmin || false,
        };
      }

      // Subsequent requests
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email ? token.email : undefined,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: `${dbUser.firstName} ${dbUser.lastName}`,
        email: dbUser.email,
        isAdmin: dbUser.isAdmin,
        picture: dbUser.profileImage,
      };
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
  }
}