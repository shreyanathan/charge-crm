"use client";

import { useState } from "react";
import type { ConversationTalkStatus } from "@/types/conversation";

interface StatusToggleProps {
  conversationId: string;
  initialStatus: ConversationTalkStatus;
}

export function StatusToggle({ conversationId, initialStatus }: StatusToggleProps) {
  const [status, setStatus] = useState<ConversationTalkStatus>(initialStatus);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next: ConversationTalkStatus =
      status === "waiting_on_us" ? "waiting_on_them" : "waiting_on_us";
    setSaving(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_status: next }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus(next);
    } catch {
      // revert on error — no-op, status stays unchanged
    } finally {
      setSaving(false);
    }
  }

  const isWaitingOnUs = status === "waiting_on_us";

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        isWaitingOnUs
          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
      title="Click to toggle"
    >
      {isWaitingOnUs ? "⚡ Waiting on us" : "⏳ Waiting on them"}
      {saving && <span className="opacity-50"> …</span>}
    </button>
  );
}
