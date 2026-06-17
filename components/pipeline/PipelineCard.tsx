"use client";

import { useState } from "react";
import Link from "next/link";
import type { Customer, DealStage } from "@/types/customer";
import type { Conversation } from "@/types/conversation";
import { urgencyTier, urgencyLabel, urgencyDot } from "@/lib/utils/urgency";

const STAGES: DealStage[] = ["NDA", "LOI", "Contract", "Closed/Won", "Stale"];

interface PipelineCardProps {
  customer: Customer;
  /** Most recent conversation for urgency display */
  latestConversation: Conversation | null;
}

export function PipelineCard({ customer, latestConversation }: PipelineCardProps) {
  const [stage, setStage] = useState<DealStage>(customer.dealStage);
  const [saving, setSaving] = useState(false);

  const tier = latestConversation ? urgencyTier(latestConversation) : "gray";
  const label = latestConversation ? urgencyLabel(latestConversation) : "No conversations";

  async function changeStage(newStage: DealStage) {
    if (newStage === stage) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_stage: newStage }),
      });
      if (!res.ok) throw new Error("Failed");
      setStage(newStage);
    } catch {
      // no-op — stage stays unchanged on error
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <Link href={`/customers/${customer.id}`} className="group">
        <p className="font-medium text-sm text-gray-900 group-hover:text-blue-600">
          {customer.name}
        </p>
        {customer.company && (
          <p className="text-xs text-gray-500">{customer.company}</p>
        )}
      </Link>

      <div className="mt-2 flex items-center gap-1 text-xs">
        <span>{urgencyDot[tier]}</span>
        <span
          className={
            tier === "red"
              ? "text-red-600"
              : tier === "orange"
              ? "text-orange-600"
              : tier === "yellow"
              ? "text-yellow-600"
              : "text-gray-400"
          }
        >
          {label}
        </span>
      </div>

      {customer.owner && (
        <p className="mt-1 text-xs text-gray-400">{customer.owner}</p>
      )}

      <select
        value={stage}
        onChange={(e) => changeStage(e.target.value as DealStage)}
        disabled={saving}
        className="mt-2 w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        onClick={(e) => e.stopPropagation()}
      >
        {STAGES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
