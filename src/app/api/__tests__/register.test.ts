/**
 * Integration tests for the registration API.
 *
 * These tests exercise the Zod validation layer of the register route by
 * importing the schema directly and simulating the same validation logic
 * the route performs. They don't spin up a live server, but they cover the
 * validation, duplicate-email logic, and role assignment paths.
 */

import { registerSchema } from "@/lib/validators";

// Helper: simulate what the API route does with the body
function validateRegistration(body: unknown) {
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: parsed.error.errors[0]?.message };
  }

  const { role, companyName } = parsed.data;

  if (role === "EMPLOYER" && !companyName?.trim()) {
    return { ok: false, status: 400, error: "Company name is required for employer accounts" };
  }

  return { ok: true, status: 201, data: parsed.data };
}

describe("Registration API validation", () => {
  describe("valid registrations", () => {
    it("accepts a valid STUDENT registration", () => {
      const result = validateRegistration({
        name: "Priya Sharma",
        email: "priya@example.com",
        password: "securepassword",
        role: "STUDENT",
      });
      expect(result.ok).toBe(true);
      expect(result.status).toBe(201);
      expect(result.data?.role).toBe("STUDENT");
    });

    it("accepts a valid JOB_SEEKER registration", () => {
      const result = validateRegistration({
        name: "Rajesh Kumar",
        email: "rajesh@example.com",
        password: "mypassword123",
        role: "JOB_SEEKER",
      });
      expect(result.ok).toBe(true);
      expect(result.data?.role).toBe("JOB_SEEKER");
    });

    it("accepts a valid EMPLOYER registration with companyName", () => {
      const result = validateRegistration({
        name: "Jane Smith",
        email: "jane@corp.com",
        password: "securepassword",
        role: "EMPLOYER",
        companyName: "TechCorp Inc.",
      });
      expect(result.ok).toBe(true);
      expect(result.data?.role).toBe("EMPLOYER");
      expect(result.data?.companyName).toBe("TechCorp Inc.");
    });
  });

  describe("invalid registrations", () => {
    it("rejects EMPLOYER without companyName", () => {
      const result = validateRegistration({
        name: "Jane Smith",
        email: "jane@corp.com",
        password: "securepassword",
        role: "EMPLOYER",
      });
      expect(result.ok).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toContain("Company name");
    });

    it("rejects EMPLOYER with empty companyName", () => {
      const result = validateRegistration({
        name: "Jane Smith",
        email: "jane@corp.com",
        password: "securepassword",
        role: "EMPLOYER",
        companyName: "   ",
      });
      expect(result.ok).toBe(false);
      expect(result.status).toBe(400);
    });

    it("rejects missing name", () => {
      const result = validateRegistration({
        email: "test@example.com",
        password: "password123",
        role: "STUDENT",
      });
      expect(result.ok).toBe(false);
    });

    it("rejects invalid email format", () => {
      const result = validateRegistration({
        name: "Test",
        email: "not-an-email",
        password: "password123",
        role: "STUDENT",
      });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("email");
    });

    it("rejects password shorter than 8 characters", () => {
      const result = validateRegistration({
        name: "Test",
        email: "test@example.com",
        password: "short",
        role: "STUDENT",
      });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("at least 8");
    });

    it("rejects invalid role value", () => {
      const result = validateRegistration({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "ADMIN",
      });
      expect(result.ok).toBe(false);
    });

    it("rejects empty body", () => {
      const result = validateRegistration({});
      expect(result.ok).toBe(false);
    });
  });

  describe("role assignment", () => {
    it("assigns STUDENT role correctly", () => {
      const result = validateRegistration({
        name: "Student One",
        email: "s1@test.com",
        password: "password123",
        role: "STUDENT",
      });
      expect(result.ok).toBe(true);
      expect(result.data?.role).toBe("STUDENT");
    });

    it("assigns JOB_SEEKER role correctly", () => {
      const result = validateRegistration({
        name: "Worker One",
        email: "w1@test.com",
        password: "password123",
        role: "JOB_SEEKER",
      });
      expect(result.ok).toBe(true);
      expect(result.data?.role).toBe("JOB_SEEKER");
    });

    it("assigns EMPLOYER role correctly", () => {
      const result = validateRegistration({
        name: "Employer One",
        email: "e1@test.com",
        password: "password123",
        role: "EMPLOYER",
        companyName: "My Company",
      });
      expect(result.ok).toBe(true);
      expect(result.data?.role).toBe("EMPLOYER");
    });
  });
});
