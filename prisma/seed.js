// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

async function main() {
  // Hash passwords for demo users
  const hashPassword = async (password) => {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
  }

  const defaultPassword = await hashPassword('Password123!')

  console.log('Starting database seed...')

  // Create users
  console.log('Seeding users...')
  const users = [
    {
      email: 'admin@camboconnect.com',
      password: defaultPassword,
      firstName: 'Admin',
      lastName: 'User',
      bio: 'System administrator',
      education: 'Computer Science, Royal University of Phnom Penh',
      skills: 'System administration, Web development, Database management',
      isAdmin: true,
      privacyLevel: 'PUBLIC'
    },
    {
      email: 'john.doe@example.com',
      password: defaultPassword,
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Software developer passionate about web technologies',
      education: 'Computer Science, University of Cambodia',
      skills: 'JavaScript, React, Node.js, MongoDB',
      privacyLevel: 'PUBLIC'
    },
    {
      email: 'sara.chen@example.com',
      password: defaultPassword,
      firstName: 'Sara',
      lastName: 'Chen',
      bio: 'UX designer with a focus on user-centered design',
      education: 'Design, Royal University of Fine Arts',
      skills: 'UI/UX Design, Figma, Adobe Creative Suite',
      privacyLevel: 'FRIENDS_ONLY'
    },
    {
      email: 'malik.johnson@example.com',
      password: defaultPassword,
      firstName: 'Malik',
      lastName: 'Johnson',
      bio: 'Entrepreneur and startup founder',
      education: 'Business Administration, National University of Management',
      skills: 'Business Development, Marketing, Project Management',
      privacyLevel: 'PUBLIC'
    },
    {
      email: 'ana.kim@example.com',
      password: defaultPassword,
      firstName: 'Ana',
      lastName: 'Kim',
      bio: 'Mobile app developer and blockchain enthusiast',
      education: 'Software Engineering, Institute of Technology of Cambodia',
      skills: 'iOS Development, Android Development, Blockchain',
      privacyLevel: 'ONLY_ME'
    }
  ]

  const createdUsers = []

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: userData,
      create: userData,
    })
    createdUsers.push(user)
  }

  // Create categories
  console.log('Seeding categories...')
  const categories = [
    { name: 'Startup', description: 'Opportunities related to startup ventures and entrepreneurship' },
    { name: 'Hackathon', description: 'Coding competitions and tech challenges' },
    { name: 'Incubation', description: 'Programs that help develop and nurture early-stage businesses' },
    { name: 'Competition', description: 'Various contests and competitive events' },
    { name: 'Internship', description: 'Work experience opportunities for students and graduates' },
    { name: 'Workshop', description: 'Educational sessions and hands-on learning experiences' },
    { name: 'Conference', description: 'Industry gatherings and networking events' },
    { name: 'Scholarship', description: 'Financial aid opportunities for education' },
    { name: 'Grant', description: 'Funding opportunities for projects and research' },
  ]

  const createdCategories = []

  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
    createdCategories.push(createdCategory)
  }

  // Create application status types
  console.log('Seeding application status types...')
  const applicationStatuses = [
    { name: 'Pending Confirmation', description: 'User has clicked apply but has not confirmed completion' },
    { name: 'Applied', description: 'User has confirmed completing the application' },
    { name: 'Not Applied', description: 'User decided not to apply' },
    { name: 'Will Apply Later', description: 'User intends to apply in the future' },
    { name: 'Shortlisted', description: 'User has been shortlisted for the opportunity' },
    { name: 'Accepted', description: 'User has been accepted for the opportunity' },
    { name: 'Rejected', description: 'User was not selected for the opportunity' },
    { name: 'Waitlisted', description: 'User is on the waitlist for the opportunity' },
    { name: 'In Progress', description: 'Application is being reviewed' },
  ]

  const createdStatuses = []

  for (const status of applicationStatuses) {
    const createdStatus = await prisma.applicationStatusType.upsert({
      where: { name: status.name },
      update: {},
      create: status,
    })
    createdStatuses.push(createdStatus)
  }

  // Create organizations
  console.log('Seeding organizations...')
  const organizations = [
    {
      name: 'Startup Cambodia',
      description: 'Supporting the Cambodian startup ecosystem',
      logo: 'startup_cambodia_logo.png',
      website: 'https://startupcambodia.org',
      history: 'Founded in 2018 to support the growing startup ecosystem in Cambodia',
      termsOfService: 'Standard terms of service apply to all our events and programs'
    },
    {
      name: 'Tech Hub Phnom Penh',
      description: 'Innovation hub for technology enthusiasts',
      logo: 'techhub_pp_logo.png',
      website: 'https://techhubpp.org',
      history: 'Started as a coworking space in 2016 and evolved into a full-fledged innovation hub',
      termsOfService: 'Each participant must adhere to our code of conduct'
    },
    {
      name: 'Digital Youth Cambodia',
      description: 'Empowering young Cambodians with digital skills',
      logo: 'dyc_logo.png',
      website: 'https://digitalyouthcambodia.org',
      history: 'Founded in 2019 with a mission to bridge the digital divide for Cambodian youth',
      termsOfService: 'We follow youth protection guidelines for all our programs'
    },
    {
      name: 'Cambodia AI Association',
      description: 'Promoting artificial intelligence research and applications',
      logo: 'caia_logo.png',
      website: 'https://cambodiaai.org',
      history: 'Established in 2020 to advance AI education and adoption in Cambodia',
      termsOfService: 'Ethical AI guidelines are required for all participants'
    }
  ]

  const createdOrganizations = []

  for (const orgData of organizations) {
    const organization = await prisma.organization.upsert({
      where: { name: orgData.name },
      update: {},
      create: orgData,
    })
    createdOrganizations.push(organization)
  }

  // Create opportunities
  console.log('Seeding opportunities...')
  const now = new Date()
  const opportunities = [
    {
      title: 'Cambodia Hackathon 2025',
      description: 'A 48-hour hackathon focused on solving local challenges using technology. Teams will compete for prizes and mentorship opportunities.',
      shortDescription: '48-hour tech competition to solve local challenges',
      eligibility: 'Open to all residents of Cambodia. Teams of 2-5 members.',
      applicationProcess: 'Submit your team information and project idea through our online portal.',
      benefits: 'Cash prizes, mentorship, networking opportunities, and potential incubation.',
      contactInfo: 'hackathon@startupcambodia.org',
      deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      startDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      endDate: new Date(now.getTime() + 47 * 24 * 60 * 60 * 1000), // 47 days from now
      status: 'ACTIVE',
      categoryId: createdCategories.find(c => c.name === 'Hackathon').id,
      organizationId: createdOrganizations.find(o => o.name === 'Startup Cambodia').id,
      visitCount: 120,
      isPopular: true,
      isNew: true
    },
    {
      title: 'Tech Startup Incubation Program',
      description: 'A 6-month incubation program for early-stage tech startups. Selected startups will receive funding, mentorship, and workspace.',
      shortDescription: '6-month program for early-stage tech startups',
      eligibility: 'Tech startups less than 2 years old with a prototype or MVP.',
      applicationProcess: 'Initial application form, followed by pitch deck submission and interview.',
      benefits: 'Seed funding of up to $10,000, office space, mentorship, and investor connections.',
      contactInfo: 'incubation@techhubpp.org',
      deadline: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      startDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      endDate: new Date(now.getTime() + 270 * 24 * 60 * 60 * 1000), // 270 days from now
      status: 'ACTIVE',
      categoryId: createdCategories.find(c => c.name === 'Incubation').id,
      organizationId: createdOrganizations.find(o => o.name === 'Tech Hub Phnom Penh').id,
      visitCount: 85,
      isPopular: true,
      isNew: false
    },
    {
      title: 'Digital Marketing Internship',
      description: 'A 3-month internship program for university students interested in digital marketing. Interns will work on real campaigns for local businesses.',
      shortDescription: '3-month digital marketing internship for students',
      eligibility: 'Current university students or recent graduates with interest in marketing.',
      applicationProcess: 'Submit your CV, portfolio, and a short essay on why you want to join.',
      benefits: 'Monthly stipend, hands-on experience, certificate, and potential job opportunities.',
      contactInfo: 'internship@digitalyouthcambodia.org',
      deadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      endDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
      status: 'CLOSING_SOON',
      categoryId: createdCategories.find(c => c.name === 'Internship').id,
      organizationId: createdOrganizations.find(o => o.name === 'Digital Youth Cambodia').id,
      visitCount: 210,
      isPopular: true,
      isNew: false
    },
    {
      title: 'AI Challenge Cambodia 2025',
      description: 'A competition to develop AI solutions for healthcare challenges in Cambodia. Participants will work with real datasets to create innovative solutions.',
      shortDescription: 'AI competition focused on healthcare solutions',
      eligibility: 'Open to individuals or teams with AI/ML experience.',
      applicationProcess: 'Register your team and submit a proposal outlining your approach.',
      benefits: 'Cash prizes, AI cloud credits, mentorship from experts, and visibility to investors.',
      contactInfo: 'challenge@cambodiaai.org',
      externalLink: 'https://aichallenge.cambodiaai.org',
      deadline: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      startDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      status: 'ACTIVE',
      categoryId: createdCategories.find(c => c.name === 'Competition').id,
      organizationId: createdOrganizations.find(o => o.name === 'Cambodia AI Association').id,
      visitCount: 65,
      isPopular: false,
      isNew: true
    },
    {
      title: 'Startup Weekend Phnom Penh',
      description: 'A 54-hour weekend event where entrepreneurs come together to pitch ideas, form teams, and launch startups.',
      shortDescription: '54-hour entrepreneurship event',
      eligibility: 'Open to anyone interested in entrepreneurship.',
      applicationProcess: 'Purchase a ticket through our website and bring your ideas.',
      benefits: 'Networking, mentorship, prizes for winning teams, and potential investor interest.',
      contactInfo: 'weekend@startupcambodia.org',
      deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      startDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      endDate: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000), // 17 days from now
      status: 'CLOSING_SOON',
      categoryId: createdCategories.find(c => c.name === 'Startup').id,
      organizationId: createdOrganizations.find(o => o.name === 'Startup Cambodia').id,
      visitCount: 95,
      isPopular: false,
      isNew: true
    }
  ]

  const createdOpportunities = []

  for (const opportunityData of opportunities) {
    const opportunity = await prisma.opportunity.create({
      data: opportunityData
    })
    createdOpportunities.push(opportunity)
  }

  // Create bookmarks
  console.log('Seeding bookmarks...')
  const bookmarks = [
    {
      userId: createdUsers[1].id, // John Doe
      opportunityId: createdOpportunities[0].id // Cambodia Hackathon
    },
    {
      userId: createdUsers[1].id, // John Doe
      opportunityId: createdOpportunities[3].id // AI Challenge
    },
    {
      userId: createdUsers[2].id, // Sara Chen
      opportunityId: createdOpportunities[1].id // Tech Startup Incubation
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      opportunityId: createdOpportunities[1].id // Tech Startup Incubation
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      opportunityId: createdOpportunities[4].id // Startup Weekend
    },
    {
      userId: createdUsers[4].id, // Ana Kim
      opportunityId: createdOpportunities[0].id // Cambodia Hackathon
    }
  ]
  
  for (const bookmarkData of bookmarks) {
    await prisma.bookmark.create({
      data: bookmarkData
    })
  }

  // Create applications
  console.log('Seeding applications...')
  const applications = [
    {
      userId: createdUsers[1].id, // John Doe
      opportunityId: createdOpportunities[0].id, // Cambodia Hackathon
      statusId: createdStatuses.find(s => s.name === 'Applied').id,
      feedback: 'The application process was straightforward and well-explained.'
    },
    {
      userId: createdUsers[2].id, // Sara Chen
      opportunityId: createdOpportunities[1].id, // Tech Startup Incubation
      statusId: createdStatuses.find(s => s.name === 'In Progress').id,
      feedback: 'Had to submit a lot of documents, but the process was worth it.'
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      opportunityId: createdOpportunities[1].id, // Tech Startup Incubation
      statusId: createdStatuses.find(s => s.name === 'Applied').id
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      opportunityId: createdOpportunities[4].id, // Startup Weekend
      statusId: createdStatuses.find(s => s.name === 'Will Apply Later').id
    },
    {
      userId: createdUsers[4].id, // Ana Kim
      opportunityId: createdOpportunities[3].id, // AI Challenge
      statusId: createdStatuses.find(s => s.name === 'Pending Confirmation').id
    }
  ]
  
  for (const applicationData of applications) {
    await prisma.application.create({
      data: applicationData
    })
  }

  // Create follows (users following organizations)
  console.log('Seeding follows...')
  const follows = [
    {
      userId: createdUsers[1].id, // John Doe
      organizationId: createdOrganizations[0].id // Startup Cambodia
    },
    {
      userId: createdUsers[1].id, // John Doe
      organizationId: createdOrganizations[3].id // Cambodia AI Association
    },
    {
      userId: createdUsers[2].id, // Sara Chen
      organizationId: createdOrganizations[1].id // Tech Hub Phnom Penh
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      organizationId: createdOrganizations[0].id // Startup Cambodia
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      organizationId: createdOrganizations[1].id // Tech Hub Phnom Penh
    },
    {
      userId: createdUsers[4].id, // Ana Kim
      organizationId: createdOrganizations[3].id // Cambodia AI Association
    }
  ]
  
  for (const followData of follows) {
    await prisma.follow.create({
      data: followData
    })
  }

  // Create friend requests
  console.log('Seeding friend requests...')
  const friendRequests = [
    {
      senderId: createdUsers[1].id, // John Doe
      receiverId: createdUsers[2].id, // Sara Chen
      status: 'ACCEPTED'
    },
    {
      senderId: createdUsers[1].id, // John Doe
      receiverId: createdUsers[3].id, // Malik Johnson
      status: 'ACCEPTED'
    },
    {
      senderId: createdUsers[2].id, // Sara Chen
      receiverId: createdUsers[4].id, // Ana Kim
      status: 'PENDING'
    },
    {
      senderId: createdUsers[3].id, // Malik Johnson
      receiverId: createdUsers[4].id, // Ana Kim
      status: 'DECLINED'
    }
  ]
  
  for (const requestData of friendRequests) {
    await prisma.friendRequest.create({
      data: requestData
    })
  }

  // Create friendships (based on accepted friend requests)
  console.log('Seeding friendships...')
  const friendships = [
    {
      userId: createdUsers[1].id, // John Doe
      friendId: createdUsers[2].id // Sara Chen
    },
    {
      userId: createdUsers[2].id, // Sara Chen
      friendId: createdUsers[1].id // John Doe
    },
    {
      userId: createdUsers[1].id, // John Doe
      friendId: createdUsers[3].id // Malik Johnson
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      friendId: createdUsers[1].id // John Doe
    }
  ]
  
  for (const friendshipData of friendships) {
    await prisma.friendship.create({
      data: friendshipData
    })
  }

  // Create participations (users who participated in past opportunities)
  console.log('Seeding participations...')
  const previousYear = new Date().getFullYear() - 1
  const participations = [
    {
      userId: createdUsers[1].id, // John Doe
      opportunityId: createdOpportunities[0].id, // Cambodia Hackathon (as if it happened last year too)
      year: previousYear,
      feedback: 'Great experience, learned a lot and made valuable connections.',
      privacyLevel: 'PUBLIC'
    },
    {
      userId: createdUsers[2].id, // Sara Chen
      opportunityId: createdOpportunities[0].id, // Cambodia Hackathon
      year: previousYear,
      feedback: 'Challenging but rewarding experience. Would participate again.',
      privacyLevel: 'PUBLIC'
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      opportunityId: createdOpportunities[4].id, // Startup Weekend
      year: previousYear,
      feedback: 'Amazing mentors and great networking opportunities.',
      privacyLevel: 'PUBLIC'
    },
    {
      userId: createdUsers[4].id, // Ana Kim
      opportunityId: createdOpportunities[3].id, // AI Challenge
      year: previousYear,
      feedback: 'The competition was well-organized with interesting problem statements.',
      privacyLevel: 'ONLY_ME'
    }
  ]
  
  for (const participationData of participations) {
    await prisma.participation.create({
      data: participationData
    })
  }

  // Create notifications
  console.log('Seeding notifications...')
  const notifications = [
    {
      userId: createdUsers[1].id, // John Doe
      type: 'NEW_OPPORTUNITY',
      message: 'New hackathon opportunity: AI Challenge Cambodia 2025',
      relatedEntityId: createdOpportunities[3].id
    },
    {
      userId: createdUsers[1].id, // John Doe
      type: 'DEADLINE_REMINDER',
      message: 'Application deadline for Cambodia Hackathon 2025 is approaching!',
      relatedEntityId: createdOpportunities[0].id,
      isRead: true
    },
    {
      userId: createdUsers[2].id, // Sara Chen
      type: 'APPLICATION_UPDATE',
      message: 'Your application for Tech Startup Incubation Program is now in progress',
      relatedEntityId: createdOpportunities[1].id
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      type: 'FRIEND_REQUEST',
      message: 'John Doe sent you a friend request',
      relatedEntityId: createdUsers[1].id,
      isRead: true
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      type: 'ORGANIZATION_UPDATE',
      message: 'Startup Cambodia posted a new opportunity: Startup Weekend Phnom Penh',
      relatedEntityId: createdOpportunities[4].id
    },
    {
      userId: createdUsers[4].id, // Ana Kim
      type: 'FRIEND_REQUEST',
      message: 'Sara Chen sent you a friend request',
      relatedEntityId: createdUsers[2].id
    }
  ]
  
  for (const notificationData of notifications) {
    await prisma.notification.create({
      data: notificationData
    })
  }

  // Create conversations and messages
  console.log('Seeding conversations and messages...')
  
  // Conversation 1: John Doe and Sara Chen
  const conversation1 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: createdUsers[1].id }, // John Doe
          { userId: createdUsers[2].id }, // Sara Chen
        ]
      }
    }
  })
  
  // Messages for conversation 1
  const conversation1Messages = [
    {
      senderId: createdUsers[1].id,
      content: "Hi Sara, I saw you're also planning to apply for the Tech Startup Incubation Program. Have you started your application yet?",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    },
    {
      senderId: createdUsers[2].id,
      content: "Hey John! Yes, I've started gathering materials for it. The requirements are quite detailed, but I'm excited about the opportunity.",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000) // 3 days ago + 10 minutes
    },
    {
      senderId: createdUsers[1].id,
      content: "That's great! Maybe we could collaborate on some parts of the application? I'd be interested in sharing ideas.",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000) // 3 days ago + 25 minutes
    },
    {
      senderId: createdUsers[2].id,
      content: "That sounds like a good plan. Let's schedule a call to discuss the details.",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000) // 3 days ago + 40 minutes
    }
  ]
  
  for (const messageData of conversation1Messages) {
    await prisma.message.create({
      data: {
        ...messageData,
        conversationId: conversation1.id
      }
    })
  }
  
  // Conversation 2: John Doe and Malik Johnson
  const conversation2 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: createdUsers[1].id }, // John Doe
          { userId: createdUsers[3].id }, // Malik Johnson
        ]
      }
    }
  })
  
  // Messages for conversation 2
  const conversation2Messages = [
    {
      senderId: createdUsers[3].id,
      content: "John, are you going to attend the Startup Weekend Phnom Penh next month?",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      senderId: createdUsers[1].id,
      content: "I'm planning to! I've been working on a new idea that I'd like to pitch there. What about you?",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000) // 1 day ago + 15 minutes
    },
    {
      senderId: createdUsers[3].id,
      content: "Definitely attending. I'm looking forward to networking and potentially joining a team. Your idea sounds interesting!",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000) // 1 day ago + 30 minutes
    }
  ]
  
  for (const messageData of conversation2Messages) {
    await prisma.message.create({
      data: {
        ...messageData,
        conversationId: conversation2.id
      }
    })
  }

  // Create analytics data
  console.log('Seeding analytics data...')
  
  // PageViews
  const paths = [
    '/',
    '/opportunities',
    '/opportunities/1',
    '/opportunities/2',
    '/community',
    '/community/1',
    '/profile'
  ]
  
  const devices = ['desktop', 'mobile', 'tablet']
  
  // Create some page views (50 random entries)
  for (let i = 0; i < 50; i++) {
    const randomUser = i % 5 === 0 ? null : createdUsers[Math.floor(Math.random() * createdUsers.length)].id
    const randomPath = paths[Math.floor(Math.random() * paths.length)]
    const randomDevice = devices[Math.floor(Math.random() * devices.length)]
    const randomDate = new Date(now.getTime() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
    
    await prisma.pageView.create({
      data: {
        path: randomPath,
        userId: randomUser,
        sessionId: `session-${i}`, // In real life, this would be a UUID or similar
        device: randomDevice,
        userAgent: `User agent for ${randomDevice}`, // Simplified
        createdAt: randomDate
      }
    })
  }
  
  // Event logs (30 random entries)
  const eventTypes = [
    'opportunity_view',
    'application_submit',
    'bookmark_add',
    'organization_follow',
    'user_register'
  ]
  
  for (let i = 0; i < 30; i++) {
    const randomUser = i % 4 === 0 ? null : createdUsers[Math.floor(Math.random() * createdUsers.length)].id
    const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    let entityId = null
    let entityType = null
    
    if (randomEventType === 'opportunity_view' || randomEventType === 'application_submit' || randomEventType === 'bookmark_add') {
      entityId = createdOpportunities[Math.floor(Math.random() * createdOpportunities.length)].id
      entityType = 'opportunity'
    } else if (randomEventType === 'organization_follow') {
      entityId = createdOrganizations[Math.floor(Math.random() * createdOrganizations.length)].id
      entityType = 'organization'
    }
    
    const randomDate = new Date(now.getTime() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
    
    await prisma.eventLog.create({
      data: {
        eventType: randomEventType,
        userId: randomUser,
        sessionId: `session-${i % 10}`, // Simplified
        entityId,
        entityType,
        createdAt: randomDate
      }
    })
  }
  // Daily stats for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0) // Set to beginning of day
    
    // Random stats for demo purposes
    const pageViews = Math.floor(Math.random() * 100) + 50
    const uniqueVisitors = Math.floor(pageViews * 0.7)
    const newUsers = Math.floor(Math.random() * 5)
    const applications = Math.floor(Math.random() * 10)
    const bookmarks = Math.floor(Math.random() * 15)
    
    // Create opportunity views distribution
    const opportunityViews = {}
    createdOpportunities.forEach(opp => {
      opportunityViews[opp.id] = Math.floor(Math.random() * 20)
    })
    
    // Create category views distribution
    const categoryViews = {}
    createdCategories.forEach(cat => {
      categoryViews[cat.id] = Math.floor(Math.random() * 15)
    })
    
    await prisma.dailyStats.create({
      data: {
        date,
        pageViews,
        uniqueVisitors,
        newUsers,
        applications,
        bookmarks,
        opportunityViews,
        categoryViews
      }
    })
  }

  console.log('Seeding completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
