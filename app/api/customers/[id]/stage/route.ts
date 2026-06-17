import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { updateDealStage } from "@/lib/notion/customers";
import type { DealStage } from "@/types/customer";

const VALID_STAGES: DealStage[] = ["NDA", "LOI", "Contract", "Closed/Won", "Stale"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { deal_stage } = body;

  if (!VALID_STAGES.includes(deal_stage)) {
    return NextResponse.json({ error: "Invalid deal_stage" }, { status: 400 });
  }

  try {
    const updated = await updateDealStage(id, deal_stage as DealStage);
    return NextResponse.json({ customer: updated });
  } catch (err) {
    console.error("Failed to update deal stage:", err);
    return NextResponse.json({ error: "Failed to update deal stage" }, { status: 500 });
  }
}
