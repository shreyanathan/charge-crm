import { NextResponse } from "next/server";

// Slack is out of scope for v1 — email only
export async function GET() {
  return NextResponse.json(
    { error: "Slack integration is not available in v1" },
    { status: 404 }
  );
}
