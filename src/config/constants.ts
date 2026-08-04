export const APP_NAME = "ReloCompass";

export const ROLE_LABELS: Record<string, string> = {
  STUDENT: "International Student",
  JOB_SEEKER: "Skilled Worker / Job Seeker",
  EMPLOYER: "Employer / Business",
};

export const BUDGET_CATEGORIES = [
  { key: "RENT", label: "Rent / Housing" },
  { key: "FOOD", label: "Food & Groceries" },
  { key: "TRANSPORT", label: "Transportation" },
  { key: "UTILITIES", label: "Utilities (Internet, Phone, Energy)" },
  { key: "INSURANCE", label: "Health Insurance" },
  { key: "ENTERTAINMENT", label: "Entertainment" },
  { key: "TUITION", label: "Tuition / Education" },
] as const;

export const COMMUNITY_TYPES = [
  { key: "STUDENT_CLUB", label: "Student Club" },
  { key: "CULTURAL", label: "Cultural Organization" },
  { key: "PROFESSIONAL", label: "Professional Network" },
  { key: "MENTORSHIP", label: "Mentorship Program" },
  { key: "VOLUNTEER", label: "Volunteer Opportunity" },
] as const;

export const SAFETY_TIPS = [
  "Never wire money or pay deposits before viewing the property or verifying the landlord.",
  "Use reputable, verified platforms for accommodation searches.",
  "Always request a written tenancy agreement before paying any deposit.",
  "Be cautious of listings with unusually low rent or urgent pressure to pay quickly.",
  "Verify the identity of landlords and employers before sharing personal documents.",
  "Use official government websites for visa and immigration information — never trust agents who guarantee outcomes.",
];
