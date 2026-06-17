interface SlackMessage {
  ts: string;
  channelId: string;
  text: string;
  userId: string;
  username: string;
  timestamp: string;
}
import { getSlackClient } from "./client";
import { cacheGet, cacheSet } from "@/lib/cache";

const CACHE_TTL = 5 * 60 * 1000; // 5 min
const SUPPORT_CHANNEL_ID = process.env.SLACK_SUPPORT_CHANNEL_ID ?? "";

export async function fetchMessagesForUser(slackUserId: string): Promise<SlackMessage[]> {
  const cacheKey = `slack:${slackUserId}`;
  const cached = cacheGet<SlackMessage[]>(cacheKey);
  if (cached) return cached;

  const slack = getSlackClient();
  const messages: SlackMessage[] = [];

  // Fetch DM channel with user
  try {
    const dmRes = await slack.conversations.open({ users: slackUserId });
    const dmChannelId = (dmRes as any).channel?.id;

    if (dmChannelId) {
      const histRes = await slack.conversations.history({
        channel: dmChannelId,
        limit: 20,
      });

      for (const msg of histRes.messages ?? []) {
        if (!msg.ts || !msg.text) continue;
        messages.push({
          ts: msg.ts,
          channelId: dmChannelId,
          text: msg.text,
          userId: (msg as any).user ?? slackUserId,
          username: (msg as any).username ?? "",
          timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
        });
      }
    }
  } catch {
    // DM channel may not exist; continue to support channel
  }

  // Fetch support channel messages mentioning this user
  if (SUPPORT_CHANNEL_ID) {
    try {
      const chanRes = await slack.conversations.history({
        channel: SUPPORT_CHANNEL_ID,
        limit: 100,
      });

      for (const msg of chanRes.messages ?? []) {
        if (!msg.ts || !msg.text) continue;
        if (!msg.text.includes(`<@${slackUserId}>`)) continue;
        messages.push({
          ts: msg.ts,
          channelId: SUPPORT_CHANNEL_ID,
          text: msg.text,
          userId: (msg as any).user ?? "",
          username: (msg as any).username ?? "",
          timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
        });
      }
    } catch {
      // Support channel may not be accessible
    }
  }

  // Sort descending by ts
  messages.sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));

  cacheSet(cacheKey, messages, CACHE_TTL);
  return messages;
}
