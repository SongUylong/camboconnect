// src/lib/schemas/opportunitySchema.ts
import * as z from 'zod';
import { OpportunityStatus } from '@prisma/client';

export const opportunitySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  shortDescription: z.string().min(10, "Short description is required (min 10 characters).").max(200, "Short description must be 200 characters or less."),
  description: z.string().min(50, "A detailed description is required (min 50 characters)."),
  eligibility: z.string().min(10, "Eligibility details are required (min 10 characters)."),
  applicationProcess: z.string().min(10, "Application process details are required (min 10 characters)."),
  benefits: z.string().min(10, "Benefits details are required (min 10 characters)."),
  contactInfo: z.string().min(5, "Contact information is required."),
  externalLink: z.string().url("Must be a valid URL (e.g., https://example.com)").optional().or(z.literal('')),
  // --- Dates ---
  startDate: z.date().optional().nullable(), // Application Start Date (Optional)
  deadline: z.date({ required_error: "Application deadline is required." }), // Application Deadline (Required)
  endDate: z.date().optional().nullable(), // Opportunity/Event End Date (Optional)
  // --- ---
  status: z.nativeEnum(OpportunityStatus, { required_error: "Status is required." }),
  categoryId: z.string().min(1, "Please select a category."),
  organizationId: z.string().min(1, "Please select an organization."),
  isPopular: z.boolean().default(false),
  imageUrl: z.string().url("Must be a valid URL if provided.").optional().nullable(),
})
// --- Refined Date Logic ---
.refine(data => {
    // 1. If Application Start Date exists, it must be less than or equal to the Application Deadline
    if (data.startDate && data.deadline && data.startDate > data.deadline) {
      return false;
    }
    return true;
  }, {
    message: "Application start date cannot be after the application deadline.",
    path: ["startDate"], // Error applies to Application Start Date
})
.refine(data => {
    // 2. If Opportunity End Date exists, it must be greater than or equal to the Application Deadline
    if (data.endDate && data.deadline && data.endDate < data.deadline) {
      return false;
    }
    return true;
  }, {
    message: "Opportunity end date cannot be before the application deadline.",
    path: ["endDate"], // Error applies to Opportunity End Date
});
// Note: We don't strictly need startDate <= endDate because startDate is app start and endDate is event end.
// The link is via the deadline.

export type OpportunityFormData = z.infer<typeof opportunitySchema>;