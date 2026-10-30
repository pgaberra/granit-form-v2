/**
 * Turns an error from a customer/order action into Swedish copy for the UI.
 * Raw SDK/backend messages are English and may leak internals, so they are
 * never shown as-is; unexpected ones are logged on the server.
 *
 * The context decides how a status is read: a 401 on login means wrong
 * credentials, but on any other action it means the session has expired.
 */
export type CustomerErrorContext = "login" | "signup" | "order-transfer" | "default"

const GENERIC = "Något gick fel. Försök igen."

export function customerErrorMessage(
  error: unknown,
  context: CustomerErrorContext = "default"
): string {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status: unknown }).status)
      : undefined
  const message = error instanceof Error ? error.message : String(error)

  if (context === "login" && status === 401) {
    return "Fel e-postadress eller lösenord."
  }
  if (context === "signup" && /already exists/i.test(message)) {
    return "Det finns redan ett konto med den e-postadressen."
  }
  if (context === "order-transfer") {
    if (status === 404) {
      return "Vi hittade ingen beställning med det numret."
    }
    if (/already belongs/i.test(message)) {
      return "Beställningen är redan kopplad till ditt konto."
    }
  }
  if (status === 401) {
    return "Din session har gått ut. Logga in igen."
  }

  console.error(error)
  return GENERIC
}
