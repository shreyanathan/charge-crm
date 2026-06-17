import Link from "next/link";
import type { Conversation } from "@/types/conversation";
import { urgencyTier, urgencyLabel, urgencyDot } from "@/lib/utils/urgency";
import { relativeTime } from "@/lib/utils/dates";

interface ConversationCardProps {
  conversation: Conversation;
}

export function ConversationCard({ conversation: c }: ConversationCardProps) {
  const tier = urgencyTier(c);
  const label = urgencyLabel(c);

  return (
    <Link
      href={`/conversations/${c.id}`}
      className="block border-b border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="mt-0.5 shrink-0 text-sm">{urgencyDot[tier]}</span>
          <div className="min-w-0">
            <p className="truncate font-medium text-sm text-gray-900">
              {c.customerName ? `${c.customerName} @ ${c.customerCompany}` : c.title}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {c.customerDealStage && (
                <span className="mr-1.5 font-medium">{c.customerDealStage} stage</span>
              )}
              {c.customerOwner && (
                <span className="text-gray-400">Owner: {c.customerOwner}</span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-gray-400 truncate">{c.title}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p
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
            {label}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">{relativeTime(c.lastMessageAt)}</p>
        </div>
      </div>
    </Link>
  );
}
