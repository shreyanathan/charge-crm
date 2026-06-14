import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { updateFollowUp } from "@/lib/notion/conversations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { follow_up_flag, follow_up_due_date } = body;

  try {
    const updated = await updateFollowUp(
      id,
      Boolean(follow_up_flag),
      follow_up_due_date ?? null
    );
    return NextResponse.json({ conversation: updated });
  } catch (err) {
    console.error("Failed to update follow-up:", err);
    return NextResponse.json({ error: "Failed to update follow-up" }, { status: 500 });
  }
}
