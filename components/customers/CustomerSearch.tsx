"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function CustomerSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex items-center gap-3">
      <input
        type="search"
        placeholder="Search customers…"
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => updateSearch(e.target.value)}
        className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={searchParams.get("dealStage") ?? ""}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) {
            params.set("dealStage", e.target.value);
          } else {
            params.delete("dealStage");
          }
          router.push(`${pathname}?${params.toString()}`);
        }}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All stages</option>
        <option value="NDA">NDA</option>
        <option value="LOI">LOI</option>
        <option value="Contract">Contract</option>
        <option value="Closed/Won">Closed/Won</option>
        <option value="Stale">Stale</option>
      </select>
    </div>
  );
}
