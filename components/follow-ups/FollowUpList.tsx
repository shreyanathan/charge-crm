import type { Conversation } from "@/types/conversation";
import { FollowUpRow } from "./FollowUpRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { sortByUrgency } from "@/lib/utils/urgency";

interface FollowUpListProps {
  conversations: Conversation[];
}

export function FollowUpList({ conversations }: FollowUpListProps) {
  if (conversations.length === 0) {
    return (
      <EmptyState
        title="No follow-ups"
        description="Flag conversations for follow-up and they'll appear here."
      />
    );
  }

  // Sort by stalest first within the flagged set
  const sorted = sortByUrgency(conversations);

  // Split: stale (7+ days) vs active (under 7 days)
  const now = Date.now();
  const stale = sorted.filter(
    (c) => !c.lastMessageAt || now - new Date(c.lastMessageAt).getTime() > 7 * 24 * 60 * 60 * 1000
  );
  const active = sorted.filter(
    (c) => c.lastMessageAt && now - new Date(c.lastMessageAt).getTime() <= 7 * 24 * 60 * 60 * 1000
  );

  return (
    <div className="space-y-6">
      {stale.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-600">
            Stale — 7+ days ({stale.length})
          </h2>
          <div className="overflow-hidden rounded-lg border border-red-100">
            {stale.map((c) => (
              <FollowUpRow key={c.id} conversation={c} />
            ))}
          </div>
        </section>
      )}
      {active.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Active ({active.length})
          </h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            {active.map((c) => (
              <FollowUpRow key={c.id} conversation={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
