// ./prisma/seed.ts (or ./data.ts)

import { PrismaClient, PrivacyLevel, OpportunityStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Define the single static image URL
const STATIC_IMAGE_URL = 'https://media.camboconnect.com//opportunity-images/1082ab02-4098-4bf4-82bc-957099c9531f.jpg';

// Helper function to generate random dates
function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('Starting database seeding...');
  const adminEmail = 'uylongsong@gmail.com'; // Define admin email for reuse

  // --- 1. Clean previous data (Order is important!) ---
  // Be careful with this in production!
  console.log('Cleaning existing data...');
  await prisma.bookmark.deleteMany({});
  console.log('Deleted existing Bookmarks.');
  // Add other deletions if necessary, in the correct order (dependents first)
  await prisma.opportunity.deleteMany({});
  console.log('Deleted existing Opportunities.');
  await prisma.organization.deleteMany({});
  console.log('Deleted existing Organizations.');
  await prisma.category.deleteMany({});
  console.log('Deleted existing Categories.');
  await prisma.user.deleteMany({ where: { email: { not: adminEmail } } });
  console.log('Deleted existing non-admin Users.');
  console.log('Existing data cleaned.');

  // --- 2. Create Admin User (Ensuring it exists) ---
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: 'uylongsong@gmail.com', // HASH THIS IN REAL APP
        firstName: 'Admin',
        lastName: 'User',
        profileImage: STATIC_IMAGE_URL, // Use static URL
        isAdmin: true,
        isSetup: true,
        privacyLevel: PrivacyLevel.PUBLIC,
        educationPrivacy: PrivacyLevel.PUBLIC,
        experiencePrivacy: PrivacyLevel.PUBLIC,
        skillsPrivacy: PrivacyLevel.PUBLIC,
        contactUrlPrivacy: PrivacyLevel.PUBLIC,
      },
    });
    console.log(`Admin user created: ${admin.email}`);
  } else {
    // Optionally update the existing admin's image if needed
    if (admin.profileImage !== STATIC_IMAGE_URL) {
        await prisma.user.update({
            where: { email: adminEmail },
            data: { profileImage: STATIC_IMAGE_URL }
        });
        console.log(`Updated admin user's profile image: ${admin.email}`);
    } else {
        console.log(`Admin user already exists: ${admin.email}`);
    }
  }

  // --- 3. Create Categories ---
  const categoryData = [
    { name: 'Scholarships', description: 'Educational funding opportunities' },
    { name: 'Internships', description: 'Professional training opportunities' },
    { name: 'Jobs', description: 'Full-time and part-time employment' },
    { name: 'Workshops', description: 'Skill development sessions' },
    { name: 'Fellowships', description: 'Funded research or professional development programs' },
    { name: 'Competitions', description: 'Challenges and contests with prizes' },
    { name: 'Volunteering', description: 'Opportunities to contribute to causes' },
  ];
  const existingCategories = await prisma.category.findMany({
      where: { name: { in: categoryData.map(c => c.name) } }
  });
  const existingCategoryNames = new Set(existingCategories.map(c => c.name));
  const categoriesToCreate = categoryData.filter(c => !existingCategoryNames.has(c.name));
  if (categoriesToCreate.length > 0) {
      await prisma.category.createMany({
          data: categoriesToCreate,
          skipDuplicates: true,
      });
      console.log(`Created ${categoriesToCreate.length} new categories.`);
  }
  const allCategories = await prisma.category.findMany({
      where: { name: { in: categoryData.map(c => c.name) } }
  });
  console.log(`Total relevant categories found/created: ${allCategories.length}.`);


  // --- 4. Create Organizations ---
  // Prepare organization data with the static logo URL
  const organizationBaseData = [
    { name: 'CamboTech', description: 'Leading technology company in Cambodia, focusing on innovation and development.', website: 'https://cambotech.com', history: 'Founded in 2020...' },
    { name: 'EduCambodia', description: 'A non-profit network supporting educational initiatives across Cambodia.', website: 'https://educambodia.org', history: 'Supporting students since 2015...' },
    { name: 'KhmerDevs', description: 'Community-driven organization for software developers in Cambodia.', website: 'https://khmerdevs.org', history: 'Established in 2018...' },
    { name: 'Startup Hub Phnom Penh', description: 'Incubator and co-working space supporting early-stage startups.', website: 'https://startuphubpp.com', history: 'Launched in 2019...' },
  ];
  // Add the static logo URL to each organization object
  const organizationDataWithLogo = organizationBaseData.map(org => ({
      ...org,
      logo: STATIC_IMAGE_URL // Use static URL
  }));

 // Use findMany + createMany similar to categories
  const existingOrganizations = await prisma.organization.findMany({
      where: { name: { in: organizationDataWithLogo.map(o => o.name) } }
  });
  const existingOrganizationNames = new Set(existingOrganizations.map(o => o.name));
  const organizationsToCreate = organizationDataWithLogo.filter(o => !existingOrganizationNames.has(o.name));

   if (organizationsToCreate.length > 0) {
      await prisma.organization.createMany({
          data: organizationsToCreate,
          skipDuplicates: true,
      });
      console.log(`Created ${organizationsToCreate.length} new organizations.`);
   } else {
      console.log('No new organizations to create.');
   }

   // Optionally update existing orgs' logos if needed
   const orgsToUpdate = existingOrganizations.filter(org => org.logo !== STATIC_IMAGE_URL);
   if (orgsToUpdate.length > 0) {
        console.log(`Updating logos for ${orgsToUpdate.length} existing organizations...`);
        await Promise.all(orgsToUpdate.map(org =>
            prisma.organization.update({
                where: { id: org.id },
                data: { logo: STATIC_IMAGE_URL }
            })
        ));
   }

 // Fetch all relevant organizations again to have the complete list with IDs
 const allOrganizations = await prisma.organization.findMany({
     where: { name: { in: organizationDataWithLogo.map(o => o.name) } }
 });
 console.log(`Total relevant organizations found/updated: ${allOrganizations.length}.`);


  // --- 5. Create Regular Users ---
  const userPromises = [];
  const userCount = 100;
  console.log(`Generating ${userCount} regular users...`);
  for (let i = 1; i <= userCount; i++) {
    const email = `user${i}@example.com`;
    userPromises.push(
      prisma.user.create({
        data: {
          email: email,
          password: `password${i}`, // HASH THIS IN REAL APP
          firstName: `FirstName${i}`,
          lastName: `LastName${i}`,
          profileImage: STATIC_IMAGE_URL, // Use static URL
          bio: `This is the bio for user ${i}. I am interested in opportunities.`,
          isAdmin: false,
          isSetup: true,
          privacyLevel: Math.random() > 0.5 ? PrivacyLevel.PUBLIC : PrivacyLevel.FRIENDS_ONLY,
          educationPrivacy: PrivacyLevel.FRIENDS_ONLY,
          experiencePrivacy: PrivacyLevel.FRIENDS_ONLY,
          skillsPrivacy: PrivacyLevel.PUBLIC,
          contactUrlPrivacy: PrivacyLevel.ONLY_ME,
        },
      })
    );
  }
  const userResults = await Promise.allSettled(userPromises);
  const createdUsers = userResults
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value);
  const failedUserCreations = userResults.filter(result => result.status === 'rejected');
  console.log(`Created ${createdUsers.length} regular users.`);
  if (failedUserCreations.length > 0) {
      console.error(`Failed to create ${failedUserCreations.length} users.`);
  }
  const users = createdUsers;

  // --- 6. Create Opportunities ---
  const opportunityPromises = [];
  const opportunityCount = 500;
  const statusValues = Object.values(OpportunityStatus);
  const today = new Date();
  const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());

  console.log(`Generating ${opportunityCount} opportunities...`);
  if (allCategories.length === 0 || allOrganizations.length === 0) {
    console.error("Cannot create opportunities: No categories or organizations available.");
  } else {
      for (let i = 1; i <= opportunityCount; i++) {
        const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
        const randomOrganization = allOrganizations[Math.floor(Math.random() * allOrganizations.length)];
        const deadline = getRandomDate(today, oneYearFromNow);
        const startDate = Math.random() > 0.3 ? getRandomDate(sixMonthsAgo, deadline) : undefined;
        const endDate = startDate && Math.random() > 0.2 ? getRandomDate(new Date(startDate), oneYearFromNow) : undefined;
        const randomStatus = statusValues[Math.floor(Math.random() * statusValues.length)];

        opportunityPromises.push(
          prisma.opportunity.create({
            data: {
              title: `${randomCategory.name} Opportunity #${i} at ${randomOrganization.name}`,
              description: `Detailed description for ${randomCategory.name} opportunity number ${i}. Provided by ${randomOrganization.name}.`,
              shortDescription: `Short description for ${randomCategory.name} #${i}. Join ${randomOrganization.name}.`,
              imageUrl: STATIC_IMAGE_URL, // Use static URL
              eligibility: `Eligibility criteria for opportunity ${i}.`,
              applicationProcess: `Submit your application via our online portal. Link: ${randomOrganization.website}/careers/${i}`,
              benefits: `Benefits include stipend, mentorship, networking, and ${i % 5 === 0 ? 'free coffee' : 'skill workshops'}.`,
              contactInfo: `For inquiries, contact hr@${randomOrganization.name.toLowerCase().replace(/\s+/g, '')}.com`,
              externalLink: Math.random() > 0.7 ? `${randomOrganization.website}/opportunity/${i}` : null,
              deadline: deadline,
              startDate: startDate,
              endDate: endDate,
              status: randomStatus,
              categoryId: randomCategory.id,
              organizationId: randomOrganization.id,
              visitCount: Math.floor(Math.random() * 1000),
              isPopular: Math.random() > 0.8,
              isNew: Math.random() > 0.7,
            },
          }).catch(e => {
              console.error(`Failed to create opportunity ${i}:`, e.message);
              return null;
          })
        );
      }
      const opportunityResults = await Promise.allSettled(opportunityPromises);
      const createdOpportunities = opportunityResults
          .filter(result => result.status === 'fulfilled' && result.value !== null)
          .map(result => (result as PromiseFulfilledResult<any>).value);
       const failedOpportunityCreations = opportunityResults.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && result.value === null));
      console.log(`Created ${createdOpportunities.length} opportunities.`);
       if (failedOpportunityCreations.length > 0) {
           console.error(`Failed to create ${failedOpportunityCreations.length} opportunities.`);
       }
       const opportunities = createdOpportunities;

      // --- 7. Add Bookmarks ---
      console.log('Adding some bookmarks...');
      const bookmarkPromises = [];
      if (users.length > 0 && opportunities.length > 0) {
        const usersToBookmark = users.slice(0, Math.min(users.length, 50));
        const bookmarksPerUser = 10;
        for (const user of usersToBookmark) {
            const shuffledOpps = [...opportunities].sort(() => 0.5 - Math.random()); // Create a copy before shuffling
            const oppsToBookmark = shuffledOpps.slice(0, Math.min(opportunities.length, bookmarksPerUser));
            for (const randomOpp of oppsToBookmark) {
                bookmarkPromises.push(
                    prisma.bookmark.create({
                        data: { userId: user.id, opportunityId: randomOpp.id },
                    }).catch(e => {
                        if (e.code !== 'P2002') {
                            console.error(`Bookmark creation failed for user ${user.id} opp ${randomOpp.id}:`, e.message);
                        }
                        return null;
                    })
                );
            }
        }
        const bookmarkResults = await Promise.allSettled(bookmarkPromises);
        const successfulBookmarks = bookmarkResults.filter(r => r.status === 'fulfilled' && r.value !== null).length;
        console.log(`Attempted to create ${bookmarkPromises.length} bookmarks, succeeded in ${successfulBookmarks}.`);
      } else {
          console.log('Skipping bookmark creation (no users or opportunities available).');
      }
  }

  console.log('Database has been seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Disconnecting Prisma Client...');
    await prisma.$disconnect();
  });