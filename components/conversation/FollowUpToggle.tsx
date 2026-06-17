"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface FollowUpToggleProps {
  conversationId: string;
  initialFlag: boolean;
  initialAction: string;
}

export function FollowUpToggle({
  conversationId,
  initialFlag,
  initialAction,
}: FollowUpToggleProps) {
  const [flag, setFlag] = useState(initialFlag);
  const [action, setAction] = useState(initialAction);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(newFlag: boolean, newAction: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/follow-up`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follow_up_flag: newFlag,
          follow_up_action: newAction,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setFlag(newFlag);
      setAction(newAction);
    } catch {
      setError("Failed to update. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={flag}
          onChange={(e) => save(e.target.checked, action)}
          disabled={saving}
          className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
        />
        Flag for follow-up
      </label>

      {flag && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="What needs to happen? (e.g. Review NDA draft)"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => save(flag, action)}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
