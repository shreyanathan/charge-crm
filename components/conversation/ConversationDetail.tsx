import type { Conversation } from "@/types/conversation";
import { Badge } from "@/components/ui/Badge";
import { FollowUpToggle } from "./FollowUpToggle";
import { channelLabel, channelColor } from "@/lib/utils/channels";
import { relativeTime, shortDate } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

interface ConversationDetailProps {
  conversation: Conversation;
}

export function ConversationDetail({ conversation: c }: ConversationDetailProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", channelColor(c.channel))}>
              {channelLabel(c.channel)}
            </span>
            <Badge variant={c.status === "open" ? "success" : "default"}>
              {c.status}
            </Badge>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{c.title}</h2>
        </div>
        <div className="shrink-0 text-right text-sm text-gray-500">
          <p>Last message {relativeTime(c.lastMessageAt)}</p>
          {c.syncedAt && <p className="text-xs text-gray-400">Synced {relativeTime(c.syncedAt)}</p>}
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
          initialDueDate={c.followUpDueDate}
        />
      </div>
    </div>
  );
}
