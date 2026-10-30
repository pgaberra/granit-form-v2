import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "404",
  description: "Något gick fel",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Sidan finns inte</h1>
      <p className="text-small-regular text-ui-fg-base">
        Varukorgen du försökte öppna finns inte. Rensa dina cookies och försök
        igen.
      </p>
      <InteractiveLink href="/">Till startsidan</InteractiveLink>
    </div>
  )
}
