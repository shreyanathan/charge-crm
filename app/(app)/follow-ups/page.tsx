export const dynamic = "force-dynamic";

import { TopBar } from "@/components/layout/TopBar";
import { FollowUpList } from "@/components/follow-ups/FollowUpList";
import { listConversations } from "@/lib/notion/conversations";

export default async function FollowUpsPage() {
  const conversations = await listConversations({ needsReply: true });

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Follow-ups" />
      <div className="flex-1 overflow-y-auto p-6">
        <FollowUpList conversations={conversations} />
      </div>
    </div>
  );
}
