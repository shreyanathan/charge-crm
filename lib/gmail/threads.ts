import type { GmailThread } from "@/types/integrations";
import { getGmailClient } from "./client";
import { cacheGet, cacheSet } from "@/lib/cache";

const CACHE_TTL = 10 * 60 * 1000; // 10 min

function extractHeader(headers: { name?: string | null; value?: string | null }[], name: string): string {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export async function fetchThreadsForEmail(customerEmail: string): Promise<GmailThread[]> {
  const cacheKey = `gmail:${customerEmail}`;
  const cached = cacheGet<GmailThread[]>(cacheKey);
  if (cached) return cached;

  const gmail = getGmailClient();

  const listRes = await gmail.users.threads.list({
    userId: "me",
    q: `from:${customerEmail} OR to:${customerEmail}`,
    maxResults: 20,
  });

  const threadItems = listRes.data.threads ?? [];
  const threads: GmailThread[] = [];

  for (const item of threadItems) {
    if (!item.id) continue;

    const threadRes = await gmail.users.threads.get({
      userId: "me",
      id: item.id,
      format: "metadata",
      metadataHeaders: ["Subject", "From", "Date"],
    });

    const messages = threadRes.data.messages ?? [];
    if (messages.length === 0) continue;

    const lastMessage = messages[messages.length - 1];
    const headers = lastMessage.payload?.headers ?? [];

    const subject = extractHeader(headers, "Subject") || "(no subject)";
    const from = extractHeader(headers, "From");
    const dateStr = extractHeader(headers, "Date");
    const lastMessageAt = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

    threads.push({
      threadId: item.id,
      subject,
      snippet: threadRes.data.snippet ?? "",
      lastMessageAt,
      messageCount: messages.length,
      from,
    });
  }

  cacheSet(cacheKey, threads, CACHE_TTL);
  return threads;
}
