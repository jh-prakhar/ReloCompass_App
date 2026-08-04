import { registerSchema, loginSchema, jobSchema, preferenceSchema, chatSchema } from "@/lib/validators";

describe("Validators", () => {
  describe("registerSchema", () => {
    it("accepts valid student registration", () => {
      const result = registerSchema.safeParse({
        name: "Priya Sharma",
        email: "priya@example.com",
        password: "securepassword",
        role: "STUDENT",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid employer registration with companyName", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "john@corp.com",
        password: "securepassword",
        role: "EMPLOYER",
        companyName: "Acme Corp",
      });
      expect(result.success).toBe(true);
    });

    it("rejects short name", () => {
      const result = registerSchema.safeParse({
        name: "P",
        email: "test@test.com",
        password: "password123",
        role: "STUDENT",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid email", () => {
      const result = registerSchema.safeParse({
        name: "Test User",
        email: "not-an-email",
        password: "password123",
        role: "STUDENT",
      });
      expect(result.success).toBe(false);
    });

    it("rejects short password", () => {
      const result = registerSchema.safeParse({
        name: "Test User",
        email: "test@test.com",
        password: "short",
        role: "STUDENT",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid role", () => {
      const result = registerSchema.safeParse({
        name: "Test User",
        email: "test@test.com",
        password: "password123",
        role: "ADMIN",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing role", () => {
      const result = registerSchema.safeParse({
        name: "Test User",
        email: "test@test.com",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("accepts valid credentials", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "anypassword",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "bad",
        password: "password",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("jobSchema", () => {
    it("accepts valid job", () => {
      const result = jobSchema.safeParse({
        title: "Software Engineer",
        description: "We are looking for a talented engineer to join our team.",
        skills: "JavaScript, React, Node.js",
        location: "Berlin, Germany",
      });
      expect(result.success).toBe(true);
    });

    it("rejects short title", () => {
      const result = jobSchema.safeParse({
        title: "AB",
        description: "Some description here.",
        skills: "React",
        location: "London",
      });
      expect(result.success).toBe(false);
    });

    it("rejects short description", () => {
      const result = jobSchema.safeParse({
        title: "Developer",
        description: "Too short",
        skills: "React",
        location: "London",
      });
      expect(result.success).toBe(false);
    });

    it("defaults jobType to FULL_TIME", () => {
      const result = jobSchema.safeParse({
        title: "Developer",
        description: "A great job opportunity for developers.",
        skills: "React",
        location: "London",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.jobType).toBe("FULL_TIME");
      }
    });

    it("defaults visaSponsorship to false", () => {
      const result = jobSchema.safeParse({
        title: "Developer",
        description: "A great job opportunity for developers.",
        skills: "React",
        location: "London",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.visaSponsorship).toBe(false);
      }
    });
  });

  describe("preferenceSchema", () => {
    it("accepts empty object", () => {
      const result = preferenceSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("accepts full preferences", () => {
      const result = preferenceSchema.safeParse({
        destinationCountry: "Canada",
        destinationCity: "Toronto",
        monthlyBudget: 1500,
        hasWorkVisa: true,
        yearsExperience: 5,
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative budget", () => {
      const result = preferenceSchema.safeParse({
        monthlyBudget: -100,
      });
      expect(result.success).toBe(false);
    });

    it("rejects yearsExperience > 60", () => {
      const result = preferenceSchema.safeParse({
        yearsExperience: 100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("chatSchema", () => {
    it("accepts valid message", () => {
      const result = chatSchema.safeParse({ message: "How do I find accommodation in London?" });
      expect(result.success).toBe(true);
    });

    it("rejects empty message", () => {
      const result = chatSchema.safeParse({ message: "" });
      expect(result.success).toBe(false);
    });

    it("rejects too long message", () => {
      const result = chatSchema.safeParse({ message: "x".repeat(4001) });
      expect(result.success).toBe(false);
    });
  });
});
