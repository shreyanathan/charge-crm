"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const active = (key: string, value: string) => searchParams.get(key) === value;

  return (
    <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
      {/* Quick filter tabs */}
      {[
        { label: "All", key: "conversationStatus", value: "" },
        { label: "Waiting on us", key: "conversationStatus", value: "waiting_on_us" },
        { label: "Follow-up flagged", key: "followUpOnly", value: "true" },
      ].map(({ label, key, value }) => (
        <button
          key={label}
          onClick={() => {
            // Clear both filters then set the right one
            const params = new URLSearchParams(searchParams.toString());
            params.delete("conversationStatus");
            params.delete("followUpOnly");
            if (value) params.set(key, value);
            router.push(`${pathname}?${params.toString()}`);
          }}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            (key === "conversationStatus" && searchParams.get("conversationStatus") === value && !searchParams.get("followUpOnly")) ||
            (key === "followUpOnly" && searchParams.get("followUpOnly") === "true") ||
            (label === "All" && !searchParams.get("conversationStatus") && !searchParams.get("followUpOnly"))
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
