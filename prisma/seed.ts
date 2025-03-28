import { PrismaClient, PrivacyLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@camboconnect.com',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 'password123'
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      isSetup: true,
      privacyLevel: PrivacyLevel.PUBLIC
    }
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Scholarships', description: 'Educational funding opportunities' }
    }),
    prisma.category.create({
      data: { name: 'Internships', description: 'Professional training opportunities' }
    }),
    prisma.category.create({
      data: { name: 'Jobs', description: 'Full-time and part-time employment' }
    }),
    prisma.category.create({
      data: { name: 'Workshops', description: 'Skill development sessions' }
    })
  ]);

  // Create organizations
  const organizations = await Promise.all([
    prisma.organization.create({
      data: {
        name: 'CamboTech',
        description: 'Leading technology company in Cambodia',
        website: 'https://cambotech.com',
        history: 'Founded in 2020 to promote tech education'
      }
    }),
    prisma.organization.create({
      data: {
        name: 'EduCambodia',
        description: 'Educational institution network',
        website: 'https://educambodia.org',
        history: 'Supporting Cambodian students since 2015'
      }
    })
  ]);

  // Create opportunities
  await Promise.all([
    prisma.opportunity.create({
      data: {
        title: 'Software Development Internship',
        description: 'Join our team as a software development intern',
        shortDescription: '3-month internship program for aspiring developers',
        eligibility: 'Computer Science students in their final year',
        applicationProcess: 'Submit CV and cover letter',
        benefits: 'Stipend, mentorship, potential full-time offer',
        contactInfo: 'careers@cambotech.com',
        deadline: new Date('2024-12-31'),
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-15'),
        categoryId: categories[1].id, // Internships
        organizationId: organizations[0].id, // CamboTech
        status: 'ACTIVE'
      }
    }),
    prisma.opportunity.create({
      data: {
        title: 'STEM Scholarship 2024',
        description: 'Full scholarship for STEM degree programs',
        shortDescription: 'Fully funded undergraduate scholarship',
        eligibility: 'High school graduates with excellent academic records',
        applicationProcess: 'Online application with academic transcripts',
        benefits: 'Full tuition, monthly stipend, housing',
        contactInfo: 'scholarships@educambodia.org',
        deadline: new Date('2024-06-30'),
        startDate: new Date('2024-09-01'),
        categoryId: categories[0].id, // Scholarships
        organizationId: organizations[1].id, // EduCambodia
        status: 'ACTIVE'
      }
    })
  ]);

  console.log('Database has been seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });