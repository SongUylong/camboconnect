cambo-connect/
├── .env                    # Environment variables
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── package.json            # Package configuration
├── README.md               # Project documentation
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── prisma/
│   ├── schema.prisma       # Database schema file
│   └── seed.js             # Database seed script
├── public/
│   ├── favicon.ico         # Favicon
│   └── images/             # Static images
│       ├── logo.svg        # CamboConnect logo
│       └── placeholder.jpg # Placeholder image
└── src/
    ├── app/
    │   ├── page.tsx                     # Homepage
    │   ├── layout.tsx                   # Root layout
    │   ├── globals.css                  # Global styles
    │   │
    │   ├── (auth)/
    │   │   ├── login/
    │   │   │   └── page.tsx             # Login page
    │   │   ├── register/
    │   │   │   └── page.tsx             # Registration page
    │   │   └── forgot-password/
    │   │       └── page.tsx             # Password reset page
    │   │
    │   ├── api/
    │   │   ├── auth/
    │   │   │   └── [...nextauth]/
    │   │   │       └── route.ts         # NextAuth API route
    │   │   ├── register/
    │   │   │   └── route.ts             # Registration API
    │   │   ├── opportunities/
    │   │   │   ├── route.ts             # Opportunities API
    │   │   │   └── [id]/
    │   │   │       ├── route.ts         # Single opportunity API
    │   │   │       ├── bookmark/
    │   │   │       │   └── route.ts     # Bookmark API
    │   │   │       └── apply/
    │   │   │           └── route.ts     # Application API
    │   │   ├── organizations/
    │   │   │   ├── route.ts             # Organizations API
    │   │   │   └── [id]/
    │   │   │       ├── route.ts         # Single organization API
    │   │   │       └── follow/
    │   │   │           └── route.ts     # Follow API
    │   │   ├── profile/
    │   │   │   └── route.ts             # User profile API
    │   │   ├── friends/
    │   │   │   ├── route.ts             # Friends API
    │   │   │   └── request/
    │   │   │       ├── route.ts         # Friend request API
    │   │   │       └── [id]/
    │   │   │           └── route.ts     # Friend request response API
    │   │   ├── messages/
    │   │   │   ├── route.ts             # Messages list API
    │   │   │   └── [id]/
    │   │   │       └── route.ts         # Conversation API
    │   │   ├── notifications/
    │   │   │   └── route.ts             # Notifications API
    │   │   └── admin/
    │   │       └── analytics/
    │   │           └── route.ts         # Analytics API
    │   │
    │   ├── opportunities/
    │   │   ├── page.tsx                 # Opportunities listing page
    │   │   └── [id]/
    │   │       └── page.tsx             # Opportunity detail page
    │   │
    │   ├── community/
    │   │   ├── page.tsx                 # Community/organizations listing
    │   │   └── [id]/
    │   │       └── page.tsx             # Organization detail page
    │   │
    │   ├── profile/
    │   │   ├── page.tsx                 # User profile page
    │   │   ├── edit/
    │   │   │   └── page.tsx             # Edit profile page
    │   │   ├── applications/
    │   │   │   └── page.tsx             # Applications listing page
    │   │   ├── bookmarks/
    │   │   │   └── page.tsx             # Bookmarks listing page
    │   │   ├── participations/
    │   │   │   └── page.tsx             # Participations listing page
    │   │   └── friends/
    │   │       └── page.tsx             # Friends listing page
    │   │
    │   ├── messages/
    │   │   ├── page.tsx                 # Messages home page
    │   │   └── [id]/
    │   │       └── page.tsx             # Conversation page
    │   │
    │   ├── notifications/
    │   │   └── page.tsx                 # All notifications page
    │   │
    │   ├── settings/
    │   │   └── page.tsx                 # User settings page
    │   │
    │   └── admin/
    │       ├── page.tsx                 # Admin dashboard
    │       ├── opportunities/
    │       │   ├── page.tsx             # Manage opportunities
    │       │   ├── new/
    │       │   │   └── page.tsx         # Create new opportunity
    │       │   └── [id]/
    │       │       ├── edit/
    │       │       │   └── page.tsx     # Edit opportunity
    │       │       └── delete/
    │       │           └── page.tsx     # Delete opportunity confirmation
    │       ├── organizations/
    │       │   ├── page.tsx             # Manage organizations
    │       │   ├── new/
    │       │   │   └── page.tsx         # Create new organization
    │       │   └── [id]/
    │       │       ├── edit/
    │       │       │   └── page.tsx     # Edit organization
    │       │       └── delete/
    │       │           └── page.tsx     # Delete organization confirmation
    │       ├── users/
    │       │   ├── page.tsx             # Manage users
    │       │   └── [id]/
    │       │       └── page.tsx         # Edit user
    │       ├── analytics/
    │       │   └── page.tsx             # Detailed analytics dashboard
    │       ├── export/
    │       │   └── page.tsx             # Data export page
    │       └── settings/
    │           └── page.tsx             # Admin settings page
    │
    ├── components/
    │   ├── auth/
    │   │   ├── auth-provider.tsx        # Auth context provider
    │   │   ├── login-form.tsx           # Login form component
    │   │   └── register-form.tsx        # Registration form
    │   │
    │   ├── layout/
    │   │   ├── header.tsx               # Header component
    │   │   ├── footer.tsx               # Footer component
    │   │   ├── main-layout.tsx          # Main layout wrapper
    │   │   └── notification-center.tsx  # Notification dropdown
    │   │
    │   ├── opportunities/
    │   │   ├── opportunity-card.tsx     # Opportunity card component
    │   │   ├── opportunity-filter.tsx   # Filter component
    │   │   ├── bookmark-button.tsx      # Bookmark button component
    │   │   ├── application-status-form.tsx # Application form
    │   │   └── previous-participants.tsx  # Participants listing
    │   │
    │   ├── community/
    │   │   ├── organization-card.tsx    # Organization card
    │   │   └── follow-button.tsx        # Follow button component
    │   │
    │   ├── admin/
    │   │   ├── analytics-dashboard.tsx  # Analytics charts
    │   │   ├── opportunity-form.tsx     # Opportunity editor
    │   │   └── organization-form.tsx    # Organization editor
    │   │
    │   ├── messages/
    │   │   ├── message-list.tsx         # Conversation list
    │   │   └── conversation-view.tsx    # Message thread view
    │   │
    │   ├── profile/
    │   │   ├── profile-header.tsx       # Profile header component
    │   │   ├── participation-card.tsx   # Participation card
    │   │   └── friend-card.tsx          # Friend card component
    │   │
    │   ├── ui/
    │   │   ├── button.tsx               # Button component
    │   │   ├── input.tsx                # Input component
    │   │   ├── select.tsx               # Select component
    │   │   ├── badge.tsx                # Badge component
    │   │   └── card.tsx                 # Card component
    │   │
    │   └── forms/
    │       ├── profile-form.tsx         # Profile edit form
    │       └── settings-form.tsx        # Settings form
    │
    ├── lib/
    │   ├── auth.ts                      # Authentication utilities
    │   ├── prisma.ts                    # Prisma client
    │   ├── analytics.ts                 # Analytics utilities
    │   └── utils.ts                     # Helper functions
    │
    └── types/
        ├── index.ts                     # Common type definitions
        ├── auth.ts                      # Auth related types
        ├── opportunity.ts               # Opportunity types
        ├── organization.ts              # Organization types
        └── user.ts                      # User related types