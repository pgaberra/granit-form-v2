import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Logga in",
  description: "Logga in på ditt konto.",
}

export default function Login() {
  return <LoginTemplate />
}
