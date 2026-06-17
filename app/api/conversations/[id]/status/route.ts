import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { updateConversationStatus } from "@/lib/notion/conversations";
import type { ConversationTalkStatus } from "@/types/conversation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { conversation_status } = body;

  if (!["waiting_on_us", "waiting_on_them"].includes(conversation_status)) {
    return NextResponse.json({ error: "Invalid conversation_status" }, { status: 400 });
  }

  try {
    const updated = await updateConversationStatus(id, conversation_status as ConversationTalkStatus);
    return NextResponse.json({ conversation: updated });
  } catch (err) {
    console.error("Failed to update conversation status:", err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
