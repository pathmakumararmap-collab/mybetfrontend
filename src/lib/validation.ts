/** Auth and bet request schemas, shared by the forms and the route handlers. */
import { z } from "zod";
import { LIMITS, SelectionSchema, SLIP_MODES } from "./betslip";

/** Sri Lankan mobile number in any common form → "+947XXXXXXXX". */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[\s\-()]/g, "").replace(/^\+?94/, "").replace(/^0/, "");
  return /^7\d{8}$/.test(digits) ? `+94${digits}` : null;
}

export const PhoneSchema = z.string().max(20).transform((v, ctx) => {
  const phone = normalizePhone(v);
  if (!phone) {
    ctx.addIssue({ code: "custom", message: "Enter a valid mobile number, e.g. 71 234 5678" });
    return z.NEVER;
  }
  return phone;
});

const email = z.email();

export const LoginSchema = z.object({
  login: z.string().trim().min(1, "Enter your phone number or e-mail").max(100).refine(
    v => normalizePhone(v) !== null || email.safeParse(v).success,
    "Enter a valid phone number or e-mail",
  ),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  remember: z.boolean().default(false),
});

export const SmsRequestSchema = z.object({
  phone: PhoneSchema,
  channel: z.enum(["sms", "whatsapp"]),
});

export const RegisterSchema = z.object({
  phone: PhoneSchema,
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const BetRequestSchema = z.object({
  mode: z.enum(SLIP_MODES),
  stakeCents: z.number().int().min(LIMITS.minStakeCents).max(LIMITS.maxStakeCents),
  selections: z.array(SelectionSchema).min(1).max(LIMITS.maxSelections),
}).refine(v => v.mode === "single" || v.selections.length >= 2, "An accumulator needs at least two selections");

export type LoginInput = z.input<typeof LoginSchema>;
export type BetRequest = z.infer<typeof BetRequestSchema>;

/** Field → first error message, for forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    out[key] ??= issue.message;
  }
  return out;
}
