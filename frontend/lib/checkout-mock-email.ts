export type CheckEmailResult = { found: true; name: string } | { found: false }

/**
 * Checks whether an email belongs to an existing account.
 */
export async function checkEmail(email: string): Promise<CheckEmailResult> {
  const res = await fetch("/api/auth/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  })

  if (!res.ok) {
    return { found: false }
  }

  const data = (await res.json()) as { exists: boolean; firstName: string | null }

  if (data.exists) {
    return { found: true, name: data.firstName?.trim() || "there" }
  }

  return { found: false }
}
