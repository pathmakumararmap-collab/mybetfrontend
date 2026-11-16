import { describe, expect, it } from "vitest";
import { BetRequestSchema, LoginSchema, RegisterSchema, SmsRequestSchema, fieldErrors, normalizePhone } from "@/lib/validation";

describe("normalizePhone", () => {
  it.each([
    ["71 234 5678", "+94712345678"],
    ["0712345678", "+94712345678"],
    ["+94 71-234-5678", "+94712345678"],
    ["94712345678", "+94712345678"],
  ])("%s → %s", (input, out) => expect(normalizePhone(input)).toBe(out));

  it.each(["112345678", "7123", "0812345678", "+1 712 345 678", "71234567890"])("rejects %s", input =>
    expect(normalizePhone(input)).toBeNull());
});

describe("auth schemas", () => {
  it("accepts a phone or an e-mail as login", () => {
    expect(LoginSchema.safeParse({ login: "0712345678", password: "secret123" }).success).toBe(true);
    expect(LoginSchema.safeParse({ login: "a@b.lk", password: "secret123" }).success).toBe(true);
    const bad = LoginSchema.safeParse({ login: "nope", password: "short" });
    expect(bad.success).toBe(false);
    if (!bad.success) expect(fieldErrors(bad.error)).toMatchObject({ login: expect.any(String), password: expect.stringMatching(/8 characters/) });
  });

  it("normalises the phone for SMS and registration", () => {
    expect(SmsRequestSchema.parse({ phone: "071 234 5678", channel: "sms" }).phone).toBe("+94712345678");
    expect(SmsRequestSchema.safeParse({ phone: "0712345678", channel: "email" }).success).toBe(false);
    expect(RegisterSchema.safeParse({ phone: "0712345678", code: "12345" }).success).toBe(false);
    expect(RegisterSchema.safeParse({ phone: "0712345678", code: "123456" }).success).toBe(true);
  });
});

describe("BetRequestSchema", () => {
  const s = (id: string) => ({
    matchId: id, matchLabel: "A – B", href: "/line/x/y/z", marketId: `${id}:m`, marketName: "1X2",
    outcomeId: `${id}:m:1`, outcomeLabel: "1", odds: 2, live: false,
  });

  it("requires two selections for an accumulator and enforces stake limits", () => {
    expect(BetRequestSchema.safeParse({ mode: "accumulator", stakeCents: 100_00, selections: [s("a")] }).success).toBe(false);
    expect(BetRequestSchema.safeParse({ mode: "accumulator", stakeCents: 100_00, selections: [s("a"), s("b")] }).success).toBe(true);
    expect(BetRequestSchema.safeParse({ mode: "single", stakeCents: 10, selections: [s("a")] }).success).toBe(false);
    expect(BetRequestSchema.safeParse({ mode: "single", stakeCents: 100.5, selections: [s("a")] }).success).toBe(false);
  });
});
