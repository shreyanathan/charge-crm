export const dynamic = "force-dynamic";

import { TopBar } from "@/components/layout/TopBar";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { listCustomers } from "@/lib/notion/customers";
import { listConversations } from "@/lib/notion/conversations";

export default async function PipelinePage() {
  const [customers, conversations] = await Promise.all([
    listCustomers(),
    listConversations(),
  ]);

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Pipeline" />
      <div className="flex-1 overflow-hidden p-6">
        <PipelineBoard customers={customers} conversations={conversations} />
      </div>
    </div>
  );
}
