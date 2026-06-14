import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { listCustomers } from "@/lib/notion/customers";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  try {
    const customers = await listCustomers({ search, status });
    return NextResponse.json({ customers });
  } catch (err) {
    console.error("Failed to list customers:", err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
