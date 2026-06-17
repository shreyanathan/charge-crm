import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { fetchInboxThreads } from "@/lib/gmail/threads";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const threads = await fetchInboxThreads();
    return NextResponse.json({ threads });
  } catch (err) {
    console.error("Gmail integration error:", err);
    return NextResponse.json({ error: "Failed to fetch Gmail threads" }, { status: 500 });
  }
}
