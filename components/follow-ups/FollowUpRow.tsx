import Link from "next/link";
import type { Conversation } from "@/types/conversation";
import { relativeTime } from "@/lib/utils/dates";
import { urgencyTier, urgencyDot } from "@/lib/utils/urgency";

interface FollowUpRowProps {
  conversation: Conversation;
}

export function FollowUpRow({ conversation: c }: FollowUpRowProps) {
  const tier = urgencyTier(c);

  return (
    <Link
      href={`/conversations/${c.id}`}
      className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="shrink-0 text-sm">{urgencyDot[tier]}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {c.customerName ? `${c.customerName} @ ${c.customerCompany}` : c.title}
          </p>
          {c.followUpAction && (
            <p className="truncate text-xs text-orange-700 font-medium">{c.followUpAction}</p>
          )}
          <p className="truncate text-xs text-gray-500">{c.title}</p>
        </div>
      </div>
      <div className="ml-4 shrink-0 text-right">
        <p className="text-xs text-gray-500">Last message</p>
        <p className="text-xs font-medium text-gray-700">{relativeTime(c.lastMessageAt)}</p>
        {c.customerDealStage && (
          <p className="text-xs text-gray-400">{c.customerDealStage}</p>
        )}
      </div>
    </Link>
  );
}
