import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getCustomer } from "@/lib/notion/customers";
import { listConversations } from "@/lib/notion/conversations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const [customer, conversations] = await Promise.all([
      getCustomer(id),
      listConversations({ customerId: id }),
    ]);

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer, conversations });
  } catch (err) {
    console.error("Failed to get customer:", err);
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}
