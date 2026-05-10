/** Same-origin path only; used after mock sign-in / register. */
export function sanitizeAuthReturnUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/"
  return raw
}

export function withReturnUrl(path: string, returnUrl: string): string {
  const safe = sanitizeAuthReturnUrl(returnUrl === "" ? null : returnUrl)
  if (safe === "/") return path
  return `${path}?returnUrl=${encodeURIComponent(safe)}`
}
