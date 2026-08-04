/**
 * Integration tests for the profile/preferences API.
 *
 * Exercises the Zod validation layer of the profile route.
 */

import { preferenceSchema } from "@/lib/validators";

function validateProfileUpdate(body: unknown) {
  const parsed = preferenceSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: parsed.error.errors[0]?.message };
  }
  return { ok: true, status: 200, data: parsed.data };
}

describe("Profile API validation", () => {
  describe("valid updates", () => {
    it("accepts an empty object (no changes)", () => {
      const result = validateProfileUpdate({});
      expect(result.ok).toBe(true);
    });

    it("accepts destination country and city", () => {
      const result = validateProfileUpdate({
        destinationCountry: "Canada",
        destinationCity: "Toronto",
      });
      expect(result.ok).toBe(true);
      expect(result.data?.destinationCountry).toBe("Canada");
    });

    it("accepts monthly budget as positive number", () => {
      const result = validateProfileUpdate({ monthlyBudget: 1500 });
      expect(result.ok).toBe(true);
      expect(result.data?.monthlyBudget).toBe(1500);
    });

    it("accepts yearsExperience as integer", () => {
      const result = validateProfileUpdate({ yearsExperience: 5 });
      expect(result.ok).toBe(true);
    });

    it("accepts hasWorkVisa as boolean", () => {
      const result = validateProfileUpdate({ hasWorkVisa: true });
      expect(result.ok).toBe(true);
      expect(result.data?.hasWorkVisa).toBe(true);
    });

    it("accepts all fields together", () => {
      const result = validateProfileUpdate({
        destinationCountry: "Germany",
        destinationCity: "Berlin",
        university: "TU Berlin",
        monthlyBudget: 800,
        accommodationType: "SHARED_APARTMENT",
        transportPreference: "PUBLIC",
        arrivalDate: "2026-09-01",
        targetJob: "Software Engineer",
        yearsExperience: 3,
        education: "B.Sc. Computer Science",
        languages: "English, Hindi, German",
        hasWorkVisa: false,
        expectedSalary: 60000,
        careerGoals: "Work in European tech industry",
        dietaryRestrictions: "Vegetarian",
        accessibilityNeeds: "",
      });
      expect(result.ok).toBe(true);
      expect(result.data?.destinationCountry).toBe("Germany");
    });
  });

  describe("invalid updates", () => {
    it("rejects negative monthly budget", () => {
      const result = validateProfileUpdate({ monthlyBudget: -500 });
      expect(result.ok).toBe(false);
    });

    it("rejects yearsExperience over 60", () => {
      const result = validateProfileUpdate({ yearsExperience: 100 });
      expect(result.ok).toBe(false);
    });

    it("rejects negative yearsExperience", () => {
      const result = validateProfileUpdate({ yearsExperience: -1 });
      expect(result.ok).toBe(false);
    });

    it("rejects non-integer yearsExperience", () => {
      const result = validateProfileUpdate({ yearsExperience: 3.5 });
      expect(result.ok).toBe(false);
    });

    it("rejects negative expected salary", () => {
      const result = validateProfileUpdate({ expectedSalary: -1000 });
      expect(result.ok).toBe(false);
    });

    it("rejects wrong type for hasWorkVisa", () => {
      const result = validateProfileUpdate({ hasWorkVisa: "yes" });
      expect(result.ok).toBe(false);
    });
  });

  describe("nullable fields", () => {
    it("accepts null for optional fields (clearing values)", () => {
      const result = validateProfileUpdate({
        destinationCountry: null,
        destinationCity: null,
        university: null,
      });
      expect(result.ok).toBe(true);
    });
  });
});
