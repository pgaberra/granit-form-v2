"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@modules/common/components/ui"
import { confirmEmailVerification } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type VerificationState = "verifying" | "success" | "error"

const VerifyAccount = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [state, setState] = useState<VerificationState>("verifying")
  // Guard against the effect running twice in React Strict Mode, which would
  // consume the single-use token before the customer sees the result.
  const confirmed = useRef(false)

  useEffect(() => {
    if (confirmed.current) {
      return
    }
    confirmed.current = true

    if (!token) {
      setState("error")
      return
    }

    confirmEmailVerification(token).then(({ success }) =>
      setState(success ? "success" : "error")
    )
  }, [token])

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center text-center gap-y-4"
      data-testid="verify-account-page"
    >
      <h1 className="text-large-semi uppercase">Verifiera e-post</h1>

      {state === "verifying" && (
        <p className="text-base-regular text-ui-fg-base">
          Verifierar din e-post
        </p>
      )}

      {state === "success" && (
        <>
          <p className="text-base-regular text-ui-fg-base">
            Din e-post är verifierad. Du kan nu logga in.
          </p>
          <LocalizedClientLink href="/account">
            <Button variant="primary">Gå till inloggning</Button>
          </LocalizedClientLink>
        </>
      )}

      {state === "error" && (
        <>
          <p className="text-base-regular text-ui-fg-base">
            Verifieringslänken är ogiltig eller har gått ut. Logga in för att få ett nytt verifieringsmejl.
          </p>
          <LocalizedClientLink href="/account">
            <Button variant="secondary">Gå till inloggning</Button>
          </LocalizedClientLink>
        </>
      )}
    </div>
  )
}

export default VerifyAccount
