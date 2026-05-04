import { query } from "./_generated/server";

export const whoami = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { authenticated: false, identity: null };
    return {
      authenticated: true,
      identity: {
        subject: identity.subject,
        email: identity.email,
        name: identity.name,
        tokenIdentifier: identity.tokenIdentifier,
        // Dump all fields
        raw: JSON.parse(JSON.stringify(identity)),
      },
    };
  },
});
