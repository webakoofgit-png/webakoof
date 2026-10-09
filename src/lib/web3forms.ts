// Web3Forms access keys are public form identifiers; submissions must run in the browser.
export async function notifyContactEmail(data: Record<string, string>, send: typeof fetch = fetch) {
  const response = await send("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      ...data,
      access_key: "0606c397-dc96-47e0-8087-a773a87cfdd1",
      subject: "New project enquiry - Webakoof",
      from_name: "Webakoof Website",
      botcheck: false,
    }),
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  if (!response.ok || result.success !== true) throw new Error("Email notification failed");
}
