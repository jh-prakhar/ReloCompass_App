import { z } from "zod";

export const userRoles = ["STUDENT", "JOB_SEEKER", "EMPLOYER"] as const;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  role: z.enum(userRoles),
  // Employer-only
  companyName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// User preference update — all fields optional
export const preferenceSchema = z.object({
  destinationCountry: z.string().optional().nullable(),
  destinationCity: z.string().optional().nullable(),
  university: z.string().optional().nullable(),
  employer: z.string().optional().nullable(),
  monthlyBudget: z.number().positive().optional().nullable(),
  accommodationType: z.string().optional().nullable(),
  transportPreference: z.string().optional().nullable(),
  arrivalDate: z.string().optional().nullable(),
  targetJob: z.string().optional().nullable(),
  yearsExperience: z.number().int().min(0).max(60).optional().nullable(),
  education: z.string().optional().nullable(),
  languages: z.string().optional().nullable(),
  hasWorkVisa: z.boolean().optional().nullable(),
  expectedSalary: z.number().positive().optional().nullable(),
  careerGoals: z.string().optional().nullable(),
  dietaryRestrictions: z.string().optional().nullable(),
  accessibilityNeeds: z.string().optional().nullable(),
});

export const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  skills: z.string().min(1, "At least one skill is required"),
  salaryMin: z.number().positive().optional().nullable(),
  salaryMax: z.number().positive().optional().nullable(),
  currency: z.string().default("USD"),
  location: z.string().min(1, "Location is required"),
  visaSponsorship: z.boolean().default(false),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]).default("FULL_TIME"),
});

export const applicationSchema = z.object({
  jobId: z.string().min(1),
  coverLetter: z.string().optional().nullable(),
});

export const checklistSchema = z.object({
  task: z.string().min(1, "Task is required"),
  category: z.enum(["PRE_DEPARTURE", "PACKING", "POST_ARRIVAL"]),
});

// AI chat message
export const chatSchema = z.object({
  message: z.string().min(1, "Message is required").max(4000, "Message too long"),
  sessionId: z.string().optional(),
  context: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PreferenceInput = z.infer<typeof preferenceSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
