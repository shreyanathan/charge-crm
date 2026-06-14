import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { fetchThreadsForEmail } from "@/lib/gmail/threads";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = req.nextUrl.searchParams.get("customerEmail");
  if (!email) {
    return NextResponse.json({ error: "customerEmail is required" }, { status: 400 });
  }

  try {
    const threads = await fetchThreadsForEmail(email);
    return NextResponse.json({ threads });
  } catch (err) {
    console.error("Gmail integration error:", err);
    return NextResponse.json({ error: "Failed to fetch Gmail threads" }, { status: 500 });
  }
}
