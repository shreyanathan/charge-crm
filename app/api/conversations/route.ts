import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { listConversations } from "@/lib/notion/conversations";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const customerId = searchParams.get("customerId") ?? undefined;
  const followUpOnly = searchParams.get("followUpOnly") === "true" ? true : undefined;
  const conversationStatus = searchParams.get("conversationStatus") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  try {
    const conversations = await listConversations({
      customerId,
      followUpOnly,
      conversationStatus,
      status,
    });
    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("Failed to list conversations:", err);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
