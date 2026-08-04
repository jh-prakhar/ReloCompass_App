import bcrypt from "bcryptjs";

describe("Password hashing", () => {
  it("hashes a password and verifies it", async () => {
    const password = "testpassword123";
    const hash = await bcrypt.hash(password, 12);
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(20);

    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
  });

  it("rejects wrong password", async () => {
    const password = "correctpassword";
    const hash = await bcrypt.hash(password, 12);

    const isValid = await bcrypt.compare("wrongpassword", hash);
    expect(isValid).toBe(false);
  });

  it("produces unique hashes for same password (salt)", async () => {
    const password = "samepassword";
    const hash1 = await bcrypt.hash(password, 12);
    const hash2 = await bcrypt.hash(password, 12);
    expect(hash1).not.toBe(hash2);
  });
});
