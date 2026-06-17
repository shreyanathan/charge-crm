import type { Customer, DealStage } from "@/types/customer";
import type { Conversation } from "@/types/conversation";
import { PipelineCard } from "./PipelineCard";

interface PipelineColumnProps {
  stage: DealStage;
  customers: Customer[];
  conversationsByCustomer: Map<string, Conversation[]>;
}

const stageColor: Record<DealStage, string> = {
  NDA: "bg-blue-50 border-blue-200",
  LOI: "bg-purple-50 border-purple-200",
  Contract: "bg-amber-50 border-amber-200",
  "Closed/Won": "bg-green-50 border-green-200",
  Stale: "bg-gray-50 border-gray-200",
};

const stageHeader: Record<DealStage, string> = {
  NDA: "text-blue-700",
  LOI: "text-purple-700",
  Contract: "text-amber-700",
  "Closed/Won": "text-green-700",
  Stale: "text-gray-500",
};

export function PipelineColumn({ stage, customers, conversationsByCustomer }: PipelineColumnProps) {
  return (
    <div className={`flex flex-col rounded-lg border p-3 ${stageColor[stage]}`} style={{ minWidth: "200px", width: "220px", flexShrink: 0 }}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${stageHeader[stage]}`}>{stage}</h3>
        <span className="text-xs text-gray-400">{customers.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {customers.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-4">—</p>
        ) : (
          customers.map((c) => {
            const convs = conversationsByCustomer.get(c.id) ?? [];
            // Most recent conversation (already sorted by lastMessageAt desc from Notion)
            const latest = convs[0] ?? null;
            return (
              <PipelineCard
                key={c.id}
                customer={c}
                latestConversation={latest}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
