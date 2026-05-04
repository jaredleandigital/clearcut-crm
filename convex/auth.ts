import {
  QueryCtx,
  MutationCtx,
} from "./_generated/server";

const ALLOWED_EMAILS = [
  "hello@jaredlean.digital",
];

const ALLOWED_DOMAINS = [
  "clearcutbuilders.co.nz",
];

function isAllowedEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (ALLOWED_EMAILS.includes(lower)) return true;
  const domain = lower.split("@")[1];
  return ALLOWED_DOMAINS.includes(domain);
}

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  if (!identity.email || !isAllowedEmail(identity.email)) {
    throw new Error("Access denied");
  }
  return identity;
}

export async function checkAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  if (!identity.email || !isAllowedEmail(identity.email)) return null;
  return identity;
}
