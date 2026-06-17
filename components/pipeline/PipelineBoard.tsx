import type { Customer, DealStage } from "@/types/customer";
import type { Conversation } from "@/types/conversation";
import { PipelineColumn } from "./PipelineColumn";

const STAGES: DealStage[] = ["NDA", "LOI", "Contract", "Closed/Won", "Stale"];

interface PipelineBoardProps {
  customers: Customer[];
  conversations: Conversation[];
}

export function PipelineBoard({ customers, conversations }: PipelineBoardProps) {
  // Group conversations by customerId for fast lookup
  const conversationsByCustomer = new Map<string, Conversation[]>();
  for (const c of conversations) {
    if (!conversationsByCustomer.has(c.customerId)) {
      conversationsByCustomer.set(c.customerId, []);
    }
    conversationsByCustomer.get(c.customerId)!.push(c);
  }

  // Group customers by deal stage
  const customersByStage = new Map<DealStage, Customer[]>();
  for (const stage of STAGES) {
    customersByStage.set(stage, []);
  }
  for (const customer of customers) {
    const stage = customer.dealStage;
    if (STAGES.includes(stage)) {
      customersByStage.get(stage)!.push(customer);
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => (
        <PipelineColumn
          key={stage}
          stage={stage}
          customers={customersByStage.get(stage) ?? []}
          conversationsByCustomer={conversationsByCustomer}
        />
      ))}
    </div>
  );
}
