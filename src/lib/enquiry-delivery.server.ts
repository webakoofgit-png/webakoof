export type DeliveryConfig = { endpoint?: string; token?: string };
// This helper is called only inside the server function. Credentials never enter client code.
export async function deliverEnquiry(
  data: Record<string, unknown>,
  config: DeliveryConfig,
  send: typeof fetch = fetch,
) {
  if (!config.endpoint)
    return {
      ok: false,
      message:
        "Online enquiries are not available yet. Your brief has not been sent. You can download a copy below.",
    };
  try {
    const url = new URL(config.endpoint);
    if (url.protocol !== "https:") throw new Error("HTTPS required");
    const response = await send(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
      },
      body: JSON.stringify({ ...data, source: "Webakoof website" }),
      signal: AbortSignal.timeout(12000),
      redirect: "error",
    });
    if (!response.ok) throw new Error("Delivery failed");
    return {
      ok: true,
      message: "Your project enquiry has been sent. Thank you for sharing your plans with us.",
    };
  } catch {
    return {
      ok: false,
      message:
        "We could not send your enquiry. Please try again, or download your brief to keep a copy.",
    };
  }
}
