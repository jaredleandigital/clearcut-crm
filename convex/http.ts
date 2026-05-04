import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/webhook/ninja-forms",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Verify webhook secret
    const secret = request.headers.get("X-Webhook-Secret");
    const expectedSecret = process.env.WEBHOOK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ninja Forms sends fields in different formats depending on config.
    // Support both flat fields and nested field_id format.
    const name = extractField(body, "name") || "Unknown";
    const email = extractField(body, "email") || undefined;
    const phone = extractField(body, "phone") || undefined;
    const address = extractField(body, "address") || undefined;
    const message = extractField(body, "message") || undefined;
    const service = extractField(body, "service") || undefined;

    // Map service to project type
    const projectType = inferProjectType(service, message);

    await ctx.runMutation(api.leads.createFromWebhook, {
      name,
      email,
      phone,
      projectAddress: address,
      projectType,
      notes: message,
      source: "Website",
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Also handle OPTIONS for CORS preflight
http.route({
  path: "/webhook/ninja-forms",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://clearcutbuilders.co.nz",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Webhook-Secret",
      },
    });
  }),
});

function extractField(body: Record<string, unknown>, fieldName: string): string | null {
  // Direct flat field
  if (typeof body[fieldName] === "string" && body[fieldName]) {
    return (body[fieldName] as string).trim();
  }

  // Ninja Forms fields array format: { fields: { "1": { value: "..." , key: "name" }, ... } }
  if (body.fields && typeof body.fields === "object") {
    const fields = body.fields as Record<string, { value?: string; key?: string }>;
    for (const field of Object.values(fields)) {
      if (field.key === fieldName && field.value) {
        return String(field.value).trim();
      }
    }
  }

  // Ninja Forms flat with field_ prefix
  for (const [key, value] of Object.entries(body)) {
    if (key.toLowerCase().includes(fieldName) && typeof value === "string" && value) {
      return value.trim();
    }
  }

  return null;
}

function inferProjectType(service?: string, message?: string): string {
  const text = `${service || ""} ${message || ""}`.toLowerCase();

  if (text.includes("kitchen")) return "Kitchen";
  if (text.includes("bathroom") || text.includes("ensuite")) return "Bathroom";
  if (text.includes("new build") || text.includes("new home")) return "New Build";
  if (text.includes("renovation") || text.includes("renovate") || text.includes("modernise")) return "Renovation";
  if (text.includes("extension") || text.includes("extend")) return "Extension";
  if (text.includes("deck") || text.includes("outdoor") || text.includes("pergola")) return "Deck/Outdoor";
  if (text.includes("commercial") || text.includes("office")) return "Commercial";

  if (service && service.trim()) return service.trim();
  return "General Enquiry";
}

export default http;
