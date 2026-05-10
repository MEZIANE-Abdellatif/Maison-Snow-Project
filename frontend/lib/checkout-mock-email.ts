/** Mock roster for checkout email step. Replace with a real API when auth exists. */
const MOCK_USERS: Record<string, string> = {
  "member@maisonsnow.com": "Alexandra",
  "demo@maisonsnow.com": "Maison",
}

export type CheckEmailResult = { found: true; name: string } | { found: false }

/**
 * Simulates whether an email belongs to an existing account.
 * Short delay so the Continue action feels like a round trip.
 */
export async function checkEmail(email: string): Promise<CheckEmailResult> {
  await new Promise((r) => setTimeout(r, 320))
  const key = email.trim().toLowerCase()
  const name = MOCK_USERS[key]
  if (name) return { found: true, name }
  return { found: false }
}
