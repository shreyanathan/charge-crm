import type { GmailThread } from "@/types/integrations";
import { getGmailClient } from "./client";
import { cacheGet, cacheSet } from "@/lib/cache";

const CACHE_TTL = 10 * 60 * 1000; // 10 min
const CACHE_KEY = "gmail:inbox";

function extractHeader(
  headers: { name?: string | null; value?: string | null }[],
  name: string
): string {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

// Extract email address from "Display Name <email@domain.com>" or "email@domain.com"
function extractEmail(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  return (match ? match[1] : raw).trim().toLowerCase();
}

function extractEmails(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => extractEmail(s.trim()))
    .filter(Boolean);
}

/**
 * Fetch all recent threads from the sales@ inbox.
 * Returns threads with participant emails and last-sender info for customer matching
 * and "waiting on us vs them" auto-detection.
 */
export async function fetchInboxThreads(): Promise<GmailThread[]> {
  const cached = cacheGet<GmailThread[]>(CACHE_KEY);
  if (cached) return cached;

  const gmail = getGmailClient();
  const salesEmail = (process.env.GMAIL_IMPERSONATE_EMAIL ?? "").toLowerCase();

  const listRes = await gmail.users.threads.list({
    userId: "me",
    maxResults: 100,
    q: "in:inbox OR in:sent",
  });

  const threadItems = listRes.data.threads ?? [];
  const threads: GmailThread[] = [];

  for (const item of threadItems) {
    if (!item.id) continue;

    const threadRes = await gmail.users.threads.get({
      userId: "me",
      id: item.id,
      format: "metadata",
      metadataHeaders: ["Subject", "From", "To", "CC", "Date"],
    });

    const messages = threadRes.data.messages ?? [];
    if (messages.length === 0) continue;

    const lastMessage = messages[messages.length - 1];
    const lastHeaders = lastMessage.payload?.headers ?? [];

    const subject = extractHeader(lastHeaders, "Subject") || "(no subject)";
    const lastFromRaw = extractHeader(lastHeaders, "From");
    const lastSenderEmail = extractEmail(lastFromRaw);
    const lastDateStr = extractHeader(lastHeaders, "Date");
    const lastMessageAt = lastDateStr
      ? new Date(lastDateStr).toISOString()
      : new Date().toISOString();

    // Collect all participant emails across all messages
    const participantSet = new Set<string>();
    let lastRepliedAt: string | null = null;

    for (const msg of messages) {
      const headers = msg.payload?.headers ?? [];
      const from = extractEmail(extractHeader(headers, "From"));
      const toRaw = extractHeader(headers, "To");
      const ccRaw = extractHeader(headers, "CC");

      if (from) participantSet.add(from);
      extractEmails(toRaw).forEach((e) => participantSet.add(e));
      extractEmails(ccRaw).forEach((e) => participantSet.add(e));

      // Track when we last sent a message (from sales@)
      if (from === salesEmail) {
        const dateStr = extractHeader(headers, "Date");
        if (dateStr) {
          const ts = new Date(dateStr).toISOString();
          if (!lastRepliedAt || ts > lastRepliedAt) {
            lastRepliedAt = ts;
          }
        }
      }
    }

    // Remove our own sales@ address from participants for cleaner matching
    participantSet.delete(salesEmail);

    threads.push({
      threadId: item.id,
      subject,
      snippet: threadRes.data.snippet ?? "",
      lastMessageAt,
      lastRepliedAt,
      lastSenderEmail,
      participants: Array.from(participantSet),
      messageCount: messages.length,
    });
  }

  cacheSet(CACHE_KEY, threads, CACHE_TTL);
  return threads;
}

export function clearInboxCache(): void {
  cacheSet(CACHE_KEY, null as any, 0);
}
