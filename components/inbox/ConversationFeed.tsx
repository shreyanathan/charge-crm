import type { Conversation } from "@/types/conversation";
import { ConversationCard } from "./ConversationCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { sortByUrgency } from "@/lib/utils/urgency";

interface ConversationFeedProps {
  conversations: Conversation[];
  /** Pass true when rendering inside customer profile (already filtered) */
  skipSort?: boolean;
}

export function ConversationFeed({ conversations, skipSort }: ConversationFeedProps) {
  if (conversations.length === 0) {
    return (
      <EmptyState
        title="No conversations"
        description="Conversations will appear here once synced from Gmail."
      />
    );
  }

  const sorted = skipSort ? conversations : sortByUrgency(conversations);

  return (
    <div className="divide-y divide-gray-100">
      {sorted.map((c) => (
        <ConversationCard key={c.id} conversation={c} />
      ))}
    </div>
  );
}
