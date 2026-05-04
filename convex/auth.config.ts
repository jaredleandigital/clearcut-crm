// Set CLERK_JWT_ISSUER_DOMAIN in Convex dashboard environment variables
// once your Clerk application is created.
// Format: https://your-app.clerk.accounts.dev
const authConfig = {
  providers: [
    {
      domain: "https://clearcut-crm.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};

export default authConfig;
