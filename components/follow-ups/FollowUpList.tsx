import type { Conversation } from "@/types/conversation";
import { FollowUpRow } from "./FollowUpRow";
import { EmptyState } from "@/components/ui/EmptyState";

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

  const overdue = conversations.filter(
    (c) => c.followUpDueDate && new Date(c.followUpDueDate) < new Date()
  );
  const upcoming = conversations.filter(
    (c) => !c.followUpDueDate || new Date(c.followUpDueDate) >= new Date()
  );

  return (
    <div className="space-y-6">
      {overdue.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-600">
            Overdue ({overdue.length})
          </h2>
          <div className="overflow-hidden rounded-lg border border-red-100">
            {overdue.map((c) => (
              <FollowUpRow key={c.id} conversation={c} />
            ))}
          </div>
        </section>
      )}
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Upcoming ({upcoming.length})
          </h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            {upcoming.map((c) => (
              <FollowUpRow key={c.id} conversation={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
