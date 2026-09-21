import {
  APPROVED_ADMINISTRATOR_EMAILS,
  ENQUIRY_COPY_EMAIL,
} from "./administratorEmails";

export async function sendEnquiryEmail(input: {
  name: string; email: string; organization?: string | null; subject: string; message: string;
}): Promise<{ id?: string; error?: string }> {
  const addresses = (name: string, fallback: readonly string[]) => {
    const configured = process.env[name]
      ?.split(",")
      .map((address) => address.trim())
      .filter(Boolean);
    return configured?.length ? configured : [...fallback];
  };
  const request = {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      from:
        process.env.EMAIL_FROM ??
        "RGG Website <enquiries@ganjanation.org>",
      to: addresses("EMAIL_TO", APPROVED_ADMINISTRATOR_EMAILS),
      cc: addresses("EMAIL_CC", [ENQUIRY_COPY_EMAIL]),
      reply_to: input.email,
      subject: input.subject,
      text: `Name: ${input.name}\nOrganization: ${input.organization ?? ""}\n\n${input.message}`,
    }),
  };
  const apiKey = process.env.RESEND_API_KEY;
  const response = apiKey
    ? await fetch(process.env.RESEND_API_URL ?? "https://api.resend.com/emails", {
      ...request,
      headers: { ...request.headers, authorization: `Bearer ${apiKey}` },
    })
    : await (async () => {
      const { ReplitConnectors } = await import("@replit/connectors-sdk");
      return new ReplitConnectors().proxy("resend", "/emails", request);
    })();
  const body = await response.json() as {
    id?: string;
    name?: string;
    message?: string;
  };
  if (!response.ok) {
    const detail = [body.name, body.message]
      .filter((value): value is string => typeof value === "string")
      .join(": ")
      .slice(0, 500);
    return {
      error: detail
        ? `provider_http_${response.status}: ${detail}`
        : `provider_http_${response.status}`,
    };
  }
  return typeof body.id === "string"
    ? { id: body.id }
    : { error: "provider_missing_message_id" };
}