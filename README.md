# CamboConnect - Centralized Opportunities Platform

CamboConnect is a comprehensive platform for finding and participating in opportunities across Cambodia, from startups and hackathons to incubation programs, competitions, and internships.

## Features

### Core Features

- **User Authentication**
  - Email and password authentication with secure hashing
  - Privacy controls for profile information
  - Two-factor authentication support

- **Opportunity Management**
  - Browse, search, and filter opportunities by various criteria
  - Detailed opportunity pages with comprehensive information
  - Visual card displays with status indicators and key information

- **Community Engagement**
  - Organization profiles with detailed information
  - Follow organizations to receive updates
  - Split-view layout for browsing organizations and their opportunities

- **User Profiles**
  - Complete profile management with privacy settings
  - Participation history tracking
  - Friend connections with request system

- **Application Tracking**
  - Status tracking for opportunity applications
  - Follow-up confirmations for application completion
  - Feedback collection about application processes

### Extended Features

- **Messaging System**
  - Direct messaging between users
  - Conversation management with unread indicators
  - Real-time updates with polling

- **Notifications**
  - Real-time notification system for various activities
  - Unread indicators and mark-as-read functionality
  - Actionable notifications linking to relevant content

- **Analytics**
  - Comprehensive dashboard for admins
  - Visitor tracking and engagement metrics
  - Opportunity performance analytics

- **Admin Dashboard**
  - Content management for opportunities and organizations
  - User management and moderation
  - Data export capabilities

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **UI Components**: Custom TailwindCSS components with responsive design
- **Data Visualization**: Recharts for analytics
- **Messaging**: Real-time communication with polling

## Project Structure

The project follows a modern Next.js 14 App Router architecture:

```
cambo-connect/
├── prisma/                # Database schema and seed data
├── public/                # Static assets
└── src/
    ├── app/               # Next.js app directory (pages)
    │   ├── api/           # API routes
    │   ├── (auth)/        # Authentication pages
    │   ├── opportunities/ # Opportunity pages
    │   ├── community/     # Organization pages
    │   ├── profile/       # User profile pages
    │   ├── messages/      # Messaging system
    │   ├── admin/         # Admin dashboard
    │   └── settings/      # User settings
    ├── components/        # React components
    ├── lib/               # Utility functions
    └── types/             # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cambo-connect.git
   cd cambo-connect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your database connection string and other required variables.

4. Create and seed the database:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## API Routes

The application includes a complete set of API routes:

- **Authentication**: User registration, login, and session management
- **Opportunities**: CRUD operations for opportunities and related actions
- **Organizations**: CRUD operations for organizations and following
- **Users**: Profile management and friend connections
- **Messages**: Conversation and message management
- **Notifications**: Notification creation and management
- **Admin**: Analytics and content management

## Database Schema

The database is designed with a robust schema that supports all features:

- **User Management**: User accounts, privacy settings, and relationships
- **Content Management**: Opportunities, organizations, categories
- **Engagement Tracking**: Applications, bookmarks, participations
- **Social Features**: Friend requests, friendships, followers
- **Messaging**: Conversations, messages, read receipts
- **Analytics**: Page views, event logs, daily statistics

## Extensibility

The platform is designed for easy extension:

- **New Opportunity Types**: The category system is dynamic and expandable
- **Application Status Types**: Status tracking is customizable with new status types
- **Organization Features**: Organization profiles can be extended with new fields
- **User Fields**: User profiles can be extended with additional information
- **Analytics**: The analytics system can track additional metrics as needed

## License

[MIT](LICENSE)

## Acknowledgements

- This project is built for educational purposes and is not affiliated with any existing platform.
- Special thanks to all contributors and the open-source community for providing the tools that made this possible.