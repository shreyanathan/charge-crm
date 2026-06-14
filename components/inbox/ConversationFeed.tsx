import type { Conversation } from "@/types/conversation";
import { ConversationCard } from "./ConversationCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface ConversationFeedProps {
  conversations: Conversation[];
}

export function ConversationFeed({ conversations }: ConversationFeedProps) {
  if (conversations.length === 0) {
    return (
      <EmptyState
        title="No conversations"
        description="Conversations will appear here once synced from Gmail, Slack, or Notion."
      />
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((c) => (
        <ConversationCard key={c.id} conversation={c} />
      ))}
    </div>
  );
}
