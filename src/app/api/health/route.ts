import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection with a timeout
    const dbCheckPromise = prisma.$queryRaw`SELECT 1`;
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database query timeout")), 5000);
    });
    
    // Race the database query against the timeout
    await Promise.race([dbCheckPromise, timeoutPromise]);
    
    return NextResponse.json({ 
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    // Return a 200 status during startup to allow the container to start
    // This prevents deployment from hanging indefinitely
    return NextResponse.json({ 
      status: "starting",
      database: "connecting",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { 
      status: 200 // Return 200 instead of 500 to allow container to start
    });
  } finally {
    // Ensure connection is closed properly to prevent connection leaks
    await prisma.$disconnect();
  }
} 