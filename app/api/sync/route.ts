import { NextRequest, NextResponse } from "next/server";
import { listCustomers } from "@/lib/notion/customers";
import { upsertConversation } from "@/lib/notion/conversations";
import { fetchInboxThreads, clearInboxCache } from "@/lib/gmail/threads";
import type { ConversationTalkStatus } from "@/types/conversation";

function authorizeCron(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

function getEmailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

async function runSync() {
  try {
    // Build a map of customer email → customer for fast lookup
    const customers = await listCustomers();
    const emailToCustomer = new Map<string, (typeof customers)[0]>();
    for (const c of customers) {
      if (c.email) emailToCustomer.set(c.email.toLowerCase(), c);
    }

    // Clear cache and fetch all threads from sales@ inbox
    clearInboxCache();
    const threads = await fetchInboxThreads();

    let synced = 0;
    const errors: string[] = [];

    for (const thread of threads) {
      try {
        // Find which customer this thread belongs to by matching participant emails
        let matchedCustomer: (typeof customers)[0] | null = null;
        for (const participantEmail of thread.participants) {
          const customer = emailToCustomer.get(participantEmail.toLowerCase());
          if (customer) {
            matchedCustomer = customer;
            break;
          }
        }

        if (!matchedCustomer) continue; // Thread not linked to any known customer

        // Auto-detect conversation status:
        // If the last message sender's domain matches the customer's email domain → waiting on us
        const customerDomain = getEmailDomain(matchedCustomer.email);
        const senderDomain = getEmailDomain(thread.lastSenderEmail);
        const conversationStatus: ConversationTalkStatus =
          customerDomain && senderDomain === customerDomain
            ? "waiting_on_us"
            : "waiting_on_them";

        await upsertConversation({
          title: thread.subject,
          customerId: matchedCustomer.id,
          externalId: thread.threadId,
          snippet: thread.snippet,
          lastMessageAt: thread.lastMessageAt,
          lastRepliedAt: thread.lastRepliedAt,
          conversationStatus,
        });
        synced++;
      } catch (err) {
        errors.push(`Thread ${thread.threadId}: ${err}`);
      }
    }

    return NextResponse.json({
      ok: true,
      synced,
      threads: threads.length,
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
  return runSync();
}

// Manual invocation via POST
export async function POST(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runSync();
}
