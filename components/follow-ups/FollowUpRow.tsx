import Link from "next/link";
import type { Conversation } from "@/types/conversation";
import { channelLabel, channelColor } from "@/lib/utils/channels";
import { shortDate, relativeTime } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

interface FollowUpRowProps {
  conversation: Conversation;
}

export function FollowUpRow({ conversation: c }: FollowUpRowProps) {
  const isOverdue =
    c.followUpDueDate && new Date(c.followUpDueDate) < new Date();

  return (
    <Link
      href={`/conversations/${c.id}`}
      className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-gray-50 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", channelColor(c.channel))}>
            {channelLabel(c.channel)}
          </span>
        </div>
        <p className="truncate text-sm font-medium text-gray-900">{c.title}</p>
        {c.snippet && <p className="truncate text-xs text-gray-500">{c.snippet}</p>}
      </div>
      <div className="ml-4 shrink-0 text-right">
        {c.followUpDueDate ? (
          <p className={cn("text-xs font-medium", isOverdue ? "text-red-600" : "text-gray-600")}>
            {isOverdue ? "Overdue: " : "Due: "}
            {shortDate(c.followUpDueDate)}
          </p>
        ) : (
          <p className="text-xs text-gray-400">No due date</p>
        )}
        <p className="text-xs text-gray-400">{relativeTime(c.lastMessageAt)}</p>
      </div>
    </Link>
  );
}
