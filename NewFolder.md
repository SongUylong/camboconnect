# CamboConnect Application Structure

## Complete Directory Tree
```
.
├── Folder.md
├── NewFolder.md
├── next.config.js
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.js
├── prisma
│   ├── migrations
│   │   ├── 20250228194951_init
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── seed.js
├── public
│   ├── favicon.ico
│   └── images
│       ├── logo.svg
│       └── placeholder.jpg
├── README.md
├── src
│   ├── app
│   │   ├── admin
│   │   │   ├── analytics
│   │   │   │   └── page.tsx
│   │   │   ├── export
│   │   │   │   └── page.tsx
│   │   │   ├── opportunities
│   │   │   │   ├── [id]
│   │   │   │   │   ├── delete
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── edit
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── new
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── organizations
│   │   │   │   ├── [id]
│   │   │   │   │   ├── delete
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── edit
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── new
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── settings
│   │   │   │   └── page.tsx
│   │   │   └── users
│   │   │       ├── [id]
│   │   │       │   └── page.tsx
│   │   │       └── page.tsx
│   │   ├── api
│   │   │   ├── admin
│   │   │   │   ├── analytics
│   │   │   │   │   └── route.ts
│   │   │   │   ├── categories
│   │   │   │   │   └── route.ts
│   │   │   │   └── opportunities
│   │   │   │       └── route.ts
│   │   │   ├── auth
│   │   │   │   └── [...nextauth]
│   │   │   │       └── route.ts
│   │   │   ├── friends
│   │   │   │   ├── request
│   │   │   │   │   └── [id]
│   │   │   │   │       └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── messages
│   │   │   │   ├── [id]
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── notifications
│   │   │   │   └── route.ts
│   │   │   ├── opportunities
│   │   │   │   ├── [id]
│   │   │   │   │   ├── apply
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── bookmark
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── organizations
│   │   │   │   ├── [id]
│   │   │   │   │   ├── follow
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── profile
│   │   │   │   └── route.ts
│   │   │   └── register
│   │   │       └── route.ts
│   │   ├── (auth)
│   │   │   ├── forgot-password
│   │   │   │   └── page.tsx
│   │   │   ├── login
│   │   │   │   └── page.tsx
│   │   │   └── register
│   │   │       └── page.tsx
│   │   ├── community
│   │   │   ├── [id]
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── messages
│   │   │   ├── [id]
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── notifications
│   │   │   └── page.tsx
│   │   ├── opportunities
│   │   │   ├── [id]
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── profile
│   │   │   ├── applications
│   │   │   │   └── page.tsx
│   │   │   ├── bookmarks
│   │   │   │   └── page.tsx
│   │   │   ├── edit
│   │   │   │   └── page.tsx
│   │   │   ├── friends
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   └── participations
│   │   │       └── page.tsx
│   │   └── settings
│   │       └── page.tsx
│   ├── components
│   │   ├── admin
│   │   │   ├── analytics-dashboard.tsx
│   │   │   ├── opportunity-form.tsx
│   │   │   └── organization-form.tsx
│   │   ├── auth
│   │   │   ├── auth-provider.tsx
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   ├── community
│   │   │   ├── follow-button.tsx
│   │   │   └── organization-card.tsx
│   │   ├── forms
│   │   │   ├── profile-form.tsx
│   │   │   └── settings-form.tsx
│   │   ├── layout
│   │   │   ├── footer.tsx
│   │   │   ├── header.tsx
│   │   │   ├── main-layout.tsx
│   │   │   └── notification-center.tsx
│   │   ├── messages
│   │   │   ├── conversation-view.tsx
│   │   │   └── message-list.tsx
│   │   ├── opportunities
│   │   │   ├── application-status-form.tsx
│   │   │   ├── bookmark-button.tsx
│   │   │   ├── opportunity-card.tsx
│   │   │   ├── opportunity-filter.tsx
│   │   │   └── previous-participants.tsx
│   │   ├── profile
│   │   │   ├── friend-card.tsx
│   │   │   ├── participation-card.tsx
│   │   │   └── profile-header.tsx
│   │   └── ui
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── switch.tsx
│   │       └── tabs.tsx
│   ├── lib
│   │   ├── analytics.ts
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── prisma.ts
│   │   └── utils.ts
│   ├── middleware.ts
│   └── types
│       ├── auth.ts
│       ├── index.ts
│       ├── opportunity.ts
│       ├── organization.ts
│       └── user.ts
├── tailwind.config.js
└── tsconfig.json
```

## Hidden Files
```
./.env
./.env.example
./.gitignore
```

## Project Summary

This is a Next.js application built with TypeScript, Prisma ORM, and Tailwind CSS. The application appears to be a social/professional networking platform called CamboConnect with the following features:

1. **Authentication System**
   - Login, registration, and password recovery
   - NextAuth integration

2. **User Profiles**
   - Profile editing
   - Friend management
   - Bookmarks and applications tracking
   - Participation history

3. **Messaging System**
   - Conversation views
   - Message lists

4. **Opportunities Platform**
   - Opportunity listings
   - Application system
   - Bookmarking functionality

5. **Community Features**
   - Organization profiles
   - Following system

6. **Admin Dashboard**
   - User management
   - Opportunity management
   - Organization management
   - Analytics
   - Export functionality
   - Settings

7. **Notifications System**
   - Notification center

The application follows a modern architecture with:
- Next.js App Router for routing
- API routes for backend functionality
- Component-based UI architecture
- Prisma for database access
- TypeScript for type safety

The UI components are organized in a modular way, with reusable UI components separated from feature-specific components. The application uses a clean directory structure that follows the Next.js conventions.


