import { NextResponse } from "next/server"

// Liveness only, for the platform health check and the uptime monitor. It does not call
// the backend: a backend outage should not mark the storefront container unhealthy and
// get it restarted or rolled back.
export function GET() {
  return NextResponse.json({ status: "ok" })
}
