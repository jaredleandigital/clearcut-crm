import { query } from "./_generated/server";
import { checkAuth } from "./auth";

export const checkAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { authenticated: false, authorized: false, email: null };

    const authorized = await checkAuth(ctx);
    return {
      authenticated: true,
      authorized: !!authorized,
      email: identity.email ?? null,
    };
  },
});
