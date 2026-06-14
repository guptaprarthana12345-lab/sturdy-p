export interface CompanionContext {
  // add any known properties here, keep index signature for unknowns
  [key: string]: unknown;
}

export interface CompanionResponse {
  message: string;
  // allow extra fields if backend returns more
  [key: string]: unknown;
}

export async function getCompanionMessage(context: CompanionContext): Promise<string> {
  const response = await fetch("/api/iq-agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(context),
  });

  const data = (await response.json()) as CompanionResponse;
  return data.message;
}
