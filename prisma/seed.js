// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

// Import data from separate files
const users = require('./data/users')
const categories = require('./data/categories')
const applicationStatusTypes = require('./data/applicationStatusTypes')
const organizations = require('./data/organizations')
const { generateOpportunitiesBatch } = require('./data/opportunitiesGenerator')

// Education data for users
const educationData = [
  {
    userId: '', // Will be filled in after user creation
    school: 'Royal University of Phnom Penh',
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    startDate: new Date('2015-09-01'),
    endDate: new Date('2019-06-30')
  },
  {
    userId: '', // Will be filled in after user creation
    school: 'University of Cambodia',
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    startDate: new Date('2016-09-01'),
    endDate: new Date('2020-06-30')
  },
  {
    userId: '', // Will be filled in after user creation
    school: 'Royal University of Fine Arts',
    degree: 'Bachelor of Arts',
    field: 'Design',
    startDate: new Date('2017-09-01'),
    endDate: new Date('2021-06-30')
  },
  {
    userId: '', // Will be filled in after user creation
    school: 'National University of Management',
    degree: 'Bachelor of Business Administration',
    field: 'Entrepreneurship',
    startDate: new Date('2015-09-01'),
    endDate: new Date('2019-06-30')
  },
  {
    userId: '', // Will be filled in after user creation
    school: 'Institute of Technology of Cambodia',
    degree: 'Bachelor of Engineering',
    field: 'Software Engineering',
    startDate: new Date('2016-09-01'),
    endDate: new Date('2020-06-30')
  }
]

// Skills data for users
const skillsData = [
  {
    userId: '', // Will be filled in after user creation
    name: 'System Administration'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'Web Development'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'Database Management'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'JavaScript'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'React'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'Node.js'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'MongoDB'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'UI/UX Design'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'Figma'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'Adobe Creative Suite'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'Business Development'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'Marketing'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'Project Management'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'iOS Development'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'Android Development'
  },
  {
    userId: '', // Will be filled in after user creation
    name: 'Blockchain'
  }
]

// Map of skills to user indices
const userSkillsMap = {
  0: [0, 1, 2], // Admin: System Administration, Web Development, Database Management
  1: [3, 4, 5, 6], // John: JavaScript, React, Node.js, MongoDB
  2: [7, 8, 9], // Sara: UI/UX Design, Figma, Adobe Creative Suite
  3: [10, 11, 12], // Malik: Business Development, Marketing, Project Management
  4: [13, 14, 15] // Ana: iOS Development, Android Development, Blockchain
}

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
  const createdUsers = []

  for (const userData of users) {
    // Replace the placeholder password with the hashed one
    const userDataWithHashedPassword = {
      ...userData,
      password: defaultPassword
    }
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: userDataWithHashedPassword,
      create: userDataWithHashedPassword,
    })
    createdUsers.push(user)
  }

  // Create education entries for users
  console.log('Seeding education entries...')
  for (let i = 0; i < educationData.length; i++) {
    const education = {
      ...educationData[i],
      userId: createdUsers[i].id
    }
    
    await prisma.education.create({
      data: education
    })
  }

  // Create skill entries for users
  console.log('Seeding skill entries...')
  for (const [userIndex, skillIndices] of Object.entries(userSkillsMap)) {
    const userId = createdUsers[parseInt(userIndex)].id
    
    for (const skillIndex of skillIndices) {
      const skill = {
        ...skillsData[skillIndex],
        userId
      }
      
      await prisma.skill.create({
        data: skill
      })
    }
  }

  // Create categories
  console.log('Seeding categories...')
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
  const createdStatuses = []

  for (const status of applicationStatusTypes) {
    const createdStatus = await prisma.applicationStatusType.create({
      data: status
    })
    createdStatuses.push(createdStatus)
  }

  // Create organizations
  console.log('Seeding organizations...')
  const createdOrganizations = []

  for (const orgData of organizations) {
    const organization = await prisma.organization.upsert({
      where: { name: orgData.name },
      update: {},
      create: orgData,
    })
    createdOrganizations.push(organization)
  }

  // Create opportunities in batches of 100
  console.log('Seeding 1000 opportunities in batches of 100...')
  const BATCH_SIZE = 100
  const TOTAL_OPPORTUNITIES = 1000
  
  for (let i = 0; i < TOTAL_OPPORTUNITIES; i += BATCH_SIZE) {
    console.log(`Creating opportunities batch ${i/BATCH_SIZE + 1} of ${TOTAL_OPPORTUNITIES/BATCH_SIZE}...`)
    const opportunitiesBatch = generateOpportunitiesBatch(
      BATCH_SIZE, 
      i, 
      createdCategories, 
      createdOrganizations
    )
    
    // Use createMany for better performance with large batches
    await prisma.opportunity.createMany({
      data: opportunitiesBatch,
      skipDuplicates: true, // Skip if a record with the same ID already exists
    })
  }

  // Create some sample bookmarks, applications, follows, etc. for the first few opportunities
  // We'll limit these to just a few records since we have so many opportunities now
  console.log('Seeding sample user interactions...')
  
  // Get the first 5 opportunities for sample data
  const sampleOpportunities = await prisma.opportunity.findMany({
    take: 5,
    orderBy: { id: 'asc' }
  })
  
  // Create bookmarks
  console.log('Seeding bookmarks...')
  const bookmarks = [
    {
      userId: createdUsers[1].id, // John Doe
      opportunityId: sampleOpportunities[0].id
    },
    {
      userId: createdUsers[1].id, // John Doe
      opportunityId: sampleOpportunities[3].id
    },
    {
      userId: createdUsers[2].id, // Sara Chen
      opportunityId: sampleOpportunities[1].id
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      opportunityId: sampleOpportunities[1].id
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      opportunityId: sampleOpportunities[4].id
    },
    {
      userId: createdUsers[4].id, // Ana Kim
      opportunityId: sampleOpportunities[0].id
    }
  ]
  
  for (const bookmarkData of bookmarks) {
    await prisma.bookmark.upsert({
      where: {
        userId_opportunityId: {
          userId: bookmarkData.userId,
          opportunityId: bookmarkData.opportunityId
        }
      },
      update: {},
      create: bookmarkData
    })
  }

  // Create applications
  console.log('Seeding applications...')
  const applications = [
    {
      userId: createdUsers[1].id, // John Doe
      opportunityId: sampleOpportunities[0].id,
      statusId: createdStatuses[1].id, // Applied
      feedback: 'The application process was straightforward and well-explained.'
    },
    {
      userId: createdUsers[2].id, // Sara Chen
      opportunityId: sampleOpportunities[1].id,
      statusId: createdStatuses[8].id, // In Progress
      feedback: 'Had to submit a lot of documents, but the process was worth it.'
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      opportunityId: sampleOpportunities[1].id,
      statusId: createdStatuses[1].id // Applied
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      opportunityId: sampleOpportunities[4].id,
      statusId: createdStatuses[3].id // Will Apply Later
    },
    {
      userId: createdUsers[4].id, // Ana Kim
      opportunityId: sampleOpportunities[3].id,
      statusId: createdStatuses[0].id // Pending Confirmation
    }
  ]
  
  for (const applicationData of applications) {
    await prisma.application.upsert({
      where: {
        userId_opportunityId: {
          userId: applicationData.userId,
          opportunityId: applicationData.opportunityId
        }
      },
      update: {},
      create: applicationData
    })
  }

  // Create follows (users following organizations)
  console.log('Seeding follows...')
  const follows = [
    {
      userId: createdUsers[1].id, // John Doe
      organizationId: createdOrganizations[0].id
    },
    {
      userId: createdUsers[1].id, // John Doe
      organizationId: createdOrganizations[3].id
    },
    {
      userId: createdUsers[2].id, // Sara Chen
      organizationId: createdOrganizations[1].id
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      organizationId: createdOrganizations[0].id
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      organizationId: createdOrganizations[1].id
    },
    {
      userId: createdUsers[4].id, // Ana Kim
      organizationId: createdOrganizations[3].id
    }
  ]
  
  for (const followData of follows) {
    await prisma.follow.upsert({
      where: {
        userId_organizationId: {
          userId: followData.userId,
          organizationId: followData.organizationId
        }
      },
      update: {},
      create: followData
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
    await prisma.friendRequest.upsert({
      where: {
        senderId_receiverId: {
          senderId: requestData.senderId,
          receiverId: requestData.receiverId
        }
      },
      update: {},
      create: requestData
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
    await prisma.friendship.upsert({
      where: {
        userId_friendId: {
          userId: friendshipData.userId,
          friendId: friendshipData.friendId
        }
      },
      update: {},
      create: friendshipData
    })
  }

  // Create participations (users who participated in past opportunities)
  console.log('Seeding participations...')
  const previousYear = new Date().getFullYear() - 1
  const participations = [
    {
      userId: createdUsers[1].id, // John Doe
      opportunityId: sampleOpportunities[0].id,
      year: previousYear,
      feedback: 'Great experience, learned a lot and made valuable connections.',
      privacyLevel: 'PUBLIC'
    },
    {
      userId: createdUsers[2].id, // Sara Chen
      opportunityId: sampleOpportunities[0].id,
      year: previousYear,
      feedback: 'Challenging but rewarding experience. Would participate again.',
      privacyLevel: 'PUBLIC'
    },
    {
      userId: createdUsers[3].id, // Malik Johnson
      opportunityId: sampleOpportunities[4].id,
      year: previousYear,
      feedback: 'Amazing mentors and great networking opportunities.',
      privacyLevel: 'PUBLIC'
    },
    {
      userId: createdUsers[4].id, // Ana Kim
      opportunityId: sampleOpportunities[3].id,
      year: previousYear,
      feedback: 'The competition was well-organized with interesting problem statements.',
      privacyLevel: 'ONLY_ME'
    }
  ]
  
  for (const participationData of participations) {
    await prisma.participation.upsert({
      where: {
        userId_opportunityId: {
          userId: participationData.userId,
          opportunityId: participationData.opportunityId
        }
      },
      update: {},
      create: participationData
    })
  }

  // Create notifications
  console.log('Seeding notifications...')
  const now = new Date()
  const notifications = [
    {
      userId: createdUsers[1].id, // John Doe
      type: 'NEW_OPPORTUNITY',
      message: `New opportunity: ${sampleOpportunities[3].title}`,
      relatedEntityId: sampleOpportunities[3].id
    },
    {
      userId: createdUsers[1].id, // John Doe
      type: 'DEADLINE_REMINDER',
      message: `Application deadline for ${sampleOpportunities[0].title} is approaching!`,
      relatedEntityId: sampleOpportunities[0].id,
      isRead: true
    },
    {
      userId: createdUsers[2].id, // Sara Chen
      type: 'APPLICATION_UPDATE',
      message: `Your application for ${sampleOpportunities[1].title} is now in progress`,
      relatedEntityId: sampleOpportunities[1].id
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
      message: `${createdOrganizations[0].name} posted a new opportunity: ${sampleOpportunities[4].title}`,
      relatedEntityId: sampleOpportunities[4].id
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
      entityId = sampleOpportunities[Math.floor(Math.random() * sampleOpportunities.length)].id
      entityType = 'opportunity'
    } else if (randomEventType === 'organization_follow') {
      entityId = createdOrganizations[Math.floor(Math.random() * Math.min(5, createdOrganizations.length))].id
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
    sampleOpportunities.forEach(opp => {
      opportunityViews[opp.id] = Math.floor(Math.random() * 20)
    })
    
    // Create category views distribution
    const categoryViews = {}
    createdCategories.forEach(cat => {
      categoryViews[cat.id] = Math.floor(Math.random() * 15)
    })
    
    await prisma.dailyStats.upsert({
      where: {
        date
      },
      update: {
        pageViews,
        uniqueVisitors,
        newUsers,
        applications,
        bookmarks,
        opportunityViews,
        categoryViews
      },
      create: {
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
