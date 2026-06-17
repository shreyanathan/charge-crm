export const dynamic = "force-dynamic";

import { TopBar } from "@/components/layout/TopBar";
import { FollowUpList } from "@/components/follow-ups/FollowUpList";
import { listConversations } from "@/lib/notion/conversations";
import { listCustomers } from "@/lib/notion/customers";

export default async function FollowUpsPage() {
  const [conversations, customers] = await Promise.all([
    listConversations({ followUpOnly: true }),
    listCustomers(),
  ]);

  // Build customer lookup for enriching conversations
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

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Follow-ups" />
      <div className="flex-1 overflow-y-auto p-6">
        <FollowUpList conversations={enriched} />
      </div>
    </div>
  );
}
