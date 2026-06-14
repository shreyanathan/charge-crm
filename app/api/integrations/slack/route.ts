import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { fetchMessagesForUser } from "@/lib/slack/messages";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slackUserId = req.nextUrl.searchParams.get("slackUserId");
  if (!slackUserId) {
    return NextResponse.json({ error: "slackUserId is required" }, { status: 400 });
  }

  try {
    const messages = await fetchMessagesForUser(slackUserId);
    return NextResponse.json({ messages });
  } catch (err) {
    console.error("Slack integration error:", err);
    return NextResponse.json({ error: "Failed to fetch Slack messages" }, { status: 500 });
  }
}
