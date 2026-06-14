export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { ConversationFeed } from "@/components/inbox/ConversationFeed";
import { getCustomer } from "@/lib/notion/customers";
import { listConversations } from "@/lib/notion/conversations";

interface CustomerProfilePageProps {
  params: Promise<{ id: string }>;
}

const statusVariant = {
  prospect: "warning",
  active: "success",
  churned: "default",
} as const;

export default async function CustomerProfilePage({ params }: CustomerProfilePageProps) {
  const { id } = await params;
  const [customer, conversations] = await Promise.all([
    getCustomer(id),
    listConversations({ customerId: id }),
  ]);

  if (!customer) notFound();

  return (
    <div className="flex h-full flex-col">
      <TopBar title={customer.name} />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Customer info card */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
              {customer.company && (
                <p className="text-gray-500">{customer.company}</p>
              )}
            </div>
            <Badge variant={statusVariant[customer.status]}>{customer.status}</Badge>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            {customer.email && (
              <>
                <dt className="font-medium text-gray-500">Email</dt>
                <dd className="text-gray-900">
                  <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                    {customer.email}
                  </a>
                </dd>
              </>
            )}
            {customer.slackUserId && (
              <>
                <dt className="font-medium text-gray-500">Slack ID</dt>
                <dd className="font-mono text-gray-900">{customer.slackUserId}</dd>
              </>
            )}
            {customer.owner && (
              <>
                <dt className="font-medium text-gray-500">Owner</dt>
                <dd className="text-gray-900">{customer.owner}</dd>
              </>
            )}
            {customer.notes && (
              <>
                <dt className="font-medium text-gray-500">Notes</dt>
                <dd className="text-gray-900">{customer.notes}</dd>
              </>
            )}
          </dl>
        </div>

        {/* Conversations */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Conversations ({conversations.length})
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <ConversationFeed conversations={conversations} />
          </div>
        </div>

        <div className="mt-4">
          <Link href="/customers" className="text-sm text-blue-600 hover:underline">
            ← Back to customers
          </Link>
        </div>
      </div>
    </div>
  );
}
