import type { Conversation } from "@/types/conversation";

export type UrgencyTier = "red" | "orange" | "yellow" | "gray";

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 999;
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

export function urgencyTier(c: Conversation): UrgencyTier {
  const days = daysSince(c.lastMessageAt);
  if (days >= 7) return "red"; // stale — no activity from either side in 7+ days
  if (c.followUpFlag) return "orange"; // flagged follow-up
  if (c.conversationStatus === "waiting_on_us" && days >= 2) return "yellow"; // needs reply soon
  return "gray";
}

export function urgencyLabel(c: Conversation): string {
  const tier = urgencyTier(c);
  const days = Math.floor(daysSince(c.lastMessageAt));

  if (tier === "red") return `${days}d no activity`;
  if (tier === "orange")
    return c.followUpAction ? `Follow-up: ${c.followUpAction}` : "Follow-up flagged";
  if (tier === "yellow") return `Waiting on us · ${days}d`;
  if (c.conversationStatus === "waiting_on_them") {
    return days === 0 ? "Waiting on them · today" : `Waiting on them · ${days}d`;
  }
  return "On track";
}

const tierOrder: Record<UrgencyTier, number> = { red: 0, orange: 1, yellow: 2, gray: 3 };

export function sortByUrgency(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((a, b) => {
    const ta = tierOrder[urgencyTier(a)];
    const tb = tierOrder[urgencyTier(b)];
    if (ta !== tb) return ta - tb;
    // Within same tier: stalest first (oldest lastMessageAt)
    const da = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const db = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return da - db;
  });
}

export const urgencyDot: Record<UrgencyTier, string> = {
  red: "🔴",
  orange: "🟠",
  yellow: "🟡",
  gray: "⚪",
};
