export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { ConversationDetail } from "@/components/conversation/ConversationDetail";
import { getConversation } from "@/lib/notion/conversations";

interface ConversationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;
  const conversation = await getConversation(id);

  if (!conversation) notFound();

  return (
    <div className="flex h-full flex-col">
      <TopBar title={conversation.title} />
      <div className="flex-1 overflow-y-auto p-6">
        <ConversationDetail conversation={conversation} />
        <div className="mt-4">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Back to inbox
          </Link>
        </div>
      </div>
    </div>
  );
}
