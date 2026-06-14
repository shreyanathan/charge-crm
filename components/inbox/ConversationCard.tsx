import Link from "next/link";
import type { Conversation } from "@/types/conversation";
import { Badge } from "@/components/ui/Badge";
import { channelLabel, channelColor } from "@/lib/utils/channels";
import { relativeTime, shortDate } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

interface ConversationCardProps {
  conversation: Conversation;
}

export function ConversationCard({ conversation: c }: ConversationCardProps) {
  return (
    <Link
      href={`/conversations/${c.id}`}
      className="block border-b border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", channelColor(c.channel))}>
              {channelLabel(c.channel)}
            </span>
            {c.followUpFlag && (
              <Badge variant="warning">Follow-up {c.followUpDueDate ? shortDate(c.followUpDueDate) : ""}</Badge>
            )}
            {c.status === "closed" && <Badge>Closed</Badge>}
          </div>
          <p className="truncate font-medium text-sm text-gray-900">{c.title}</p>
          {c.snippet && (
            <p className="mt-0.5 truncate text-xs text-gray-500">{c.snippet}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-gray-400">{relativeTime(c.lastMessageAt)}</p>
          {c.customerName && (
            <p className="mt-0.5 text-xs text-gray-500">{c.customerName}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
