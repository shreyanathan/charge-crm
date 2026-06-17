"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const nav = [
  { href: "/", label: "Inbox", icon: "📥" },
  { href: "/pipeline", label: "Pipeline", icon: "📊" },
  { href: "/customers", label: "Customers", icon: "👥" },
  { href: "/follow-ups", label: "Follow-ups", icon: "🔔" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-gray-200 bg-white px-3 py-4">
      <div className="mb-6 px-2">
        <span className="text-lg font-bold text-gray-900">CRM Inbox</span>
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
