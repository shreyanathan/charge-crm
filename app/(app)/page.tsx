export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { FilterBar } from "@/components/inbox/FilterBar";
import { ConversationFeed } from "@/components/inbox/ConversationFeed";
import { Spinner } from "@/components/ui/Spinner";
import { listConversations } from "@/lib/notion/conversations";

interface InboxPageProps {
  searchParams: Promise<{
    channel?: string;
    needsReply?: string;
    status?: string;
  }>;
}

async function InboxContent({ searchParams }: InboxPageProps) {
  const params = await searchParams;
  const conversations = await listConversations({
    channel: params.channel,
    needsReply: params.needsReply === "true" ? true : undefined,
    status: params.status,
  });

  return <ConversationFeed conversations={conversations} />;
}

export default function InboxPage({ searchParams }: InboxPageProps) {
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Inbox" />
      <Suspense>
        <FilterBar />
      </Suspense>
      <div className="flex-1 overflow-y-auto bg-white">
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          }
        >
          <InboxContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
