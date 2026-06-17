export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { FilterBar } from "@/components/inbox/FilterBar";
import { ConversationFeed } from "@/components/inbox/ConversationFeed";
import { Spinner } from "@/components/ui/Spinner";
import { listConversations } from "@/lib/notion/conversations";
import { listCustomers } from "@/lib/notion/customers";

interface InboxPageProps {
  searchParams: Promise<{
    conversationStatus?: string;
    followUpOnly?: string;
  }>;
}

async function InboxContent({ searchParams }: InboxPageProps) {
  const params = await searchParams;

  const [conversations, customers] = await Promise.all([
    listConversations({
      conversationStatus: params.conversationStatus,
      followUpOnly: params.followUpOnly === "true" ? true : undefined,
    }),
    listCustomers(),
  ]);

  // Enrich conversations with customer info for display
  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const enriched = conversations.map((conv) => {
    const c = customerMap.get(conv.customerId);
    return {
      ...conv,
      customerName: c?.name ?? "",
      customerCompany: c?.company ?? "",
      customerDealStage: c?.dealStage ?? "",
      customerOwner: c?.owner ?? "",
    };
  });

  return <ConversationFeed conversations={enriched} />;
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
