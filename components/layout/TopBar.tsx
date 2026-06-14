"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        {session?.user?.email && (
          <span className="text-sm text-gray-500">{session.user.email}</span>
        )}
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
