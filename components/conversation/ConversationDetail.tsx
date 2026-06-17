import type { Conversation } from "@/types/conversation";
import { FollowUpToggle } from "./FollowUpToggle";
import { StatusToggle } from "./StatusToggle";
import { relativeTime } from "@/lib/utils/dates";
import { urgencyTier, urgencyLabel, urgencyDot } from "@/lib/utils/urgency";

interface ConversationDetailProps {
  conversation: Conversation;
}

export function ConversationDetail({ conversation: c }: ConversationDetailProps) {
  const tier = urgencyTier(c);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusToggle
              conversationId={c.id}
              initialStatus={c.conversationStatus}
            />
            <span className="text-sm">
              {urgencyDot[tier]}{" "}
              <span
                className={`text-xs font-medium ${
                  tier === "red"
                    ? "text-red-600"
                    : tier === "orange"
                    ? "text-orange-600"
                    : tier === "yellow"
                    ? "text-yellow-600"
                    : "text-gray-400"
                }`}
              >
                {urgencyLabel(c)}
              </span>
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{c.title}</h2>
          {c.customerName && (
            <p className="mt-1 text-sm text-gray-500">
              {c.customerName}
              {c.customerCompany ? ` @ ${c.customerCompany}` : ""}
              {c.customerDealStage ? ` · ${c.customerDealStage} stage` : ""}
              {c.customerOwner ? ` · ${c.customerOwner}` : ""}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right text-sm text-gray-500">
          <p>Last message {relativeTime(c.lastMessageAt)}</p>
          {c.lastRepliedAt && (
            <p className="text-xs text-gray-400">We replied {relativeTime(c.lastRepliedAt)}</p>
          )}
          {c.syncedAt && (
            <p className="text-xs text-gray-400">Synced {relativeTime(c.syncedAt)}</p>
          )}
        </div>
      </div>

      {c.snippet && (
        <p className="mb-6 rounded-md bg-gray-50 p-3 text-sm text-gray-700">{c.snippet}</p>
      )}

      <div className="border-t border-gray-200 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Follow-up</h3>
        <FollowUpToggle
          conversationId={c.id}
          initialFlag={c.followUpFlag}
          initialAction={c.followUpAction}
        />
      </div>
    </div>
  );
}
