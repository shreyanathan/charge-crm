"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface FollowUpToggleProps {
  conversationId: string;
  initialFlag: boolean;
  initialDueDate: string | null;
}

export function FollowUpToggle({
  conversationId,
  initialFlag,
  initialDueDate,
}: FollowUpToggleProps) {
  const [flag, setFlag] = useState(initialFlag);
  const [dueDate, setDueDate] = useState(initialDueDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(newFlag: boolean, newDate: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/follow-up`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follow_up_flag: newFlag,
          follow_up_due_date: newDate || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setFlag(newFlag);
      setDueDate(newDate);
    } catch {
      setError("Failed to update. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={flag}
            onChange={(e) => save(e.target.checked, dueDate)}
            disabled={saving}
            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
          />
          Flag for follow-up
        </label>
      </div>

      {flag && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Due:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => save(flag, dueDate)}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save date"}
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
