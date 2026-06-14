import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getNotionClient } from "@/lib/notion/client";
import { getCustomer } from "@/lib/notion/customers";
import { cacheGet, cacheSet } from "@/lib/cache";
import type { NotionMention } from "@/types/integrations";

const CACHE_TTL = 2 * 60 * 1000; // 2 min

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }

  const cacheKey = `notion-mentions:${customerId}`;
  const cached = cacheGet<NotionMention[]>(cacheKey);
  if (cached) return NextResponse.json({ mentions: cached });

  try {
    const customer = await getCustomer(customerId);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const notion = getNotionClient();
    const res = await notion.search({
      query: customer.name,
      filter: { value: "page", property: "object" },
      sort: { direction: "descending", timestamp: "last_edited_time" },
      page_size: 20,
    });

    const mentions: NotionMention[] = res.results
      .filter((r): r is any => r.object === "page")
      .map((page: any) => ({
        pageId: page.id,
        title:
          page.properties?.["Title / Subject"]?.title?.[0]?.plain_text ??
          page.properties?.Name?.title?.[0]?.plain_text ??
          "(Untitled)",
        snippet: "",
        lastEditedAt: page.last_edited_time,
        url: page.url,
      }));

    cacheSet(cacheKey, mentions, CACHE_TTL);
    return NextResponse.json({ mentions });
  } catch (err) {
    console.error("Notion integration error:", err);
    return NextResponse.json({ error: "Failed to fetch Notion mentions" }, { status: 500 });
  }
}
