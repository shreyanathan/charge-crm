import { NextRequest, NextResponse } from "next/server";
import { listCustomers } from "@/lib/notion/customers";
import { upsertConversation } from "@/lib/notion/conversations";
import { fetchThreadsForEmail } from "@/lib/gmail/threads";
import { fetchMessagesForUser } from "@/lib/slack/messages";
import { cacheDelete } from "@/lib/cache";

function authorizeCron(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

async function runSync(req: NextRequest, body: { customerId?: string } = {}) {
  try {
    const customers = body.customerId
      ? await listCustomers().then((cs) => cs.filter((c) => c.id === body.customerId))
      : await listCustomers();

    let synced = 0;
    const errors: string[] = [];

    for (const customer of customers) {
      // Sync Gmail
      if (customer.email) {
        try {
          cacheDelete(`gmail:${customer.email}`);
          const threads = await fetchThreadsForEmail(customer.email);
          for (const thread of threads) {
            await upsertConversation({
              title: thread.subject,
              customerId: customer.id,
              channel: "email",
              externalId: thread.threadId,
              snippet: thread.snippet,
              lastMessageAt: thread.lastMessageAt,
            });
            synced++;
          }
        } catch (err) {
          errors.push(`Gmail sync failed for ${customer.email}: ${err}`);
        }
      }

      // Sync Slack
      if (customer.slackUserId) {
        try {
          cacheDelete(`slack:${customer.slackUserId}`);
          const messages = await fetchMessagesForUser(customer.slackUserId);
          for (const msg of messages) {
            await upsertConversation({
              title: `Slack message from ${msg.username || msg.userId}`,
              customerId: customer.id,
              channel: "slack",
              externalId: `${msg.ts}:${msg.channelId}`,
              snippet: msg.text,
              lastMessageAt: msg.timestamp,
            });
            synced++;
          }
        } catch (err) {
          errors.push(`Slack sync failed for ${customer.slackUserId}: ${err}`);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      synced,
      customers: customers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("Sync failed:", err);
    return NextResponse.json({ error: "Sync failed", detail: String(err) }, { status: 500 });
  }
}

// Vercel Cron sends GET
export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runSync(req);
}

// Manual invocation via POST with optional body: { customerId? }
export async function POST(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { customerId?: string } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }
  return runSync(req, body);
}
