import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { listConversations } from "@/lib/notion/conversations";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const channel = searchParams.get("channel") ?? undefined;
  const customerId = searchParams.get("customerId") ?? undefined;
  const needsReply = searchParams.get("needsReply") === "true" ? true : undefined;
  const status = searchParams.get("status") ?? undefined;

  try {
    const conversations = await listConversations({ channel, customerId, needsReply, status });
    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("Failed to list conversations:", err);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
