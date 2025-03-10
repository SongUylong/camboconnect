# CamboConnect Project Overview

## Project Description
CamboConnect is a comprehensive platform designed to connect users in Cambodia with various opportunities such as startups, hackathons, incubation programs, competitions, and internships. The platform serves as a centralized hub for opportunity discovery, application tracking, and community engagement.

## Technology Stack
- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: Custom TailwindCSS components
- **Data Visualization**: Recharts for analytics
- **Deployment**: Docker containerization

## Detailed File Structure and Functionality

### Docker Configuration Files

#### docker-compose.yml
- **Functionality**: Defines the containerization setup for development and production environments
- **Key Components**:
  - `app` service: Development environment with hot-reloading
  - `app-prod` service: Production-ready container
  - Network configuration for service communication
  - Volume mappings for code changes and persistence

#### Dockerfile
- **Functionality**: Multi-stage build process for the application
- **Key Components**:
  - Builder stage: Installs dependencies, generates Prisma client, and builds the Next.js application
  - Runner stage: Creates a minimal production image with security considerations
  - Non-root user setup for enhanced security
  - Optimized for Next.js standalone output

### Core Configuration Files

#### package.json
- **Functionality**: Defines project dependencies and scripts
- **Key Components**:
  - Project metadata: "cambo-connect" with version 0.1.0
  - Scripts for development, building, and deployment
  - Dependencies including:
    - Next.js 14 and React 18
    - Prisma ORM for database access
    - NextAuth for authentication
    - UI components from Radix UI
    - Form handling with react-hook-form and zod
    - Data visualization with Recharts
    - State management with Zustand

#### next.config.js
- **Functionality**: Configuration for Next.js framework
- **Key Components**:
  - Output configuration for standalone deployment
  - Environment variable handling
  - Image optimization settings
  - Experimental features configuration

#### tailwind.config.js
- **Functionality**: TailwindCSS configuration
- **Key Components**:
  - Custom theme settings
  - Plugin configurations including typography and animations
  - Extended color palette and component styling

### Database Configuration

#### prisma/schema.prisma
- **Functionality**: Defines the database schema and relationships
- **Key Components**:
  - Database provider configuration (PostgreSQL)
  - User model with authentication and profile data
  - NextAuth models (Account, Session, VerificationToken)
  - Opportunity and Organization models
  - Social features (Friends, Follows)
  - Application tracking models
  - Privacy and security models

#### prisma/seed.js
- **Functionality**: Populates the database with initial data
- **Key Components**:
  - Sample users with different roles
  - Categories for opportunities
  - Organizations with detailed profiles
  - Opportunities with various statuses and details

### Core Application Files

#### src/middleware.ts
- **Functionality**: Handles authentication and route protection
- **Key Components**:
  - JWT token verification
  - Protected path definitions
  - Redirection to login for unauthenticated users
  - Path matching configuration

#### src/app/layout.tsx
- **Functionality**: Root layout for the entire application
- **Key Components**:
  - Metadata configuration
  - Font loading (Inter)
  - Authentication provider wrapping
  - Application state provider
  - Toast notifications setup

### Authentication System

#### src/lib/auth.ts
- **Functionality**: NextAuth configuration and custom authentication logic
- **Key Components**:
  - Authentication providers setup
  - JWT session handling
  - Password hashing and verification
  - Two-factor authentication logic

#### src/lib/jwt.ts
- **Functionality**: JWT token generation and verification
- **Key Components**:
  - Token signing with secret key
  - Verification methods
  - Expiration handling

### Database Access

#### src/lib/prisma.ts
- **Functionality**: Prisma client initialization and caching
- **Key Components**:
  - Environment-specific client instantiation
  - Global caching for development environment
  - Singleton pattern for database connections

### API Routes

#### src/app/api/opportunities/route.ts
- **Functionality**: API endpoints for opportunity management
- **Key Components**:
  - GET: Fetches opportunities with filtering, sorting, and search
  - POST: Creates new opportunities with validation
  - Error handling and response formatting

#### src/app/api/organizations/route.ts
- **Functionality**: API endpoints for organization management
- **Key Components**:
  - GET: Retrieves organizations with filtering and search
  - POST: Creates new organizations
  - Data validation and error handling

#### src/app/api/friends/route.ts
- **Functionality**: API endpoints for friend management
- **Key Components**:
  - GET: Retrieves friend connections and requests
  - POST: Sends friend requests
  - PUT: Accepts/rejects friend requests
  - DELETE: Removes friend connections

### Frontend Pages

#### src/app/opportunities/page.tsx
- **Functionality**: Opportunity listing page
- **Key Components**:
  - Search and filtering interface
  - Opportunity cards with visual status
  - Pagination and sorting
  - Server-side rendering with data fetching

#### src/app/profile/page.tsx
- **Functionality**: User profile page
- **Key Components**:
  - Personal information display
  - Education and experience sections
  - Skills and social links
  - Privacy controls for different sections
  - Bookmarks and application history

### UI Components

#### src/components/layout/main-layout.tsx
- **Functionality**: Main application layout wrapper
- **Key Components**:
  - Navigation header
  - Footer
  - Container styling
  - Responsive design

#### src/components/opportunities/opportunity-card.tsx
- **Functionality**: Card component for opportunity display
- **Key Components**:
  - Visual representation of opportunity
  - Status indicators
  - Deadline display
  - Organization logo
  - Action buttons (bookmark, apply)

### Utility Functions

#### src/lib/utils.ts
- **Functionality**: General utility functions
- **Key Components**:
  - Date formatting
  - String manipulation
  - Class name merging
  - Form validation helpers

#### src/lib/analytics.ts
- **Functionality**: Analytics tracking
- **Key Components**:
  - Page view tracking
  - Event logging
  - User engagement metrics
  - Data aggregation functions

#### src/lib/email.ts
- **Functionality**: Email sending functionality
- **Key Components**:
  - Nodemailer configuration
  - Email templates
  - Notification emails
  - Password reset emails

### State Management

#### src/store/application-store.ts
- **Functionality**: Global state for application tracking
- **Key Components**:
  - Zustand store setup
  - Application status tracking
  - Unconfirmed applications management
  - State persistence

#### src/contexts/application-context.tsx
- **Functionality**: React context for application state
- **Key Components**:
  - Context provider
  - State sharing across components
  - Application-related actions

## Development and Deployment
The project is containerized using Docker for easy deployment and includes configuration for local development. The application follows modern Next.js 14 architecture with the App Router pattern for improved performance and developer experience.

## Current Status
The project appears to be in active development with a comprehensive feature set already implemented. The codebase follows best practices for Next.js applications with a clean separation of concerns and modular architecture. 