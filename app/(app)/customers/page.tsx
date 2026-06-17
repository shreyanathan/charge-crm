export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerSearch } from "@/components/customers/CustomerSearch";
import { Spinner } from "@/components/ui/Spinner";
import { listCustomers } from "@/lib/notion/customers";

interface CustomersPageProps {
  searchParams: Promise<{
    search?: string;
    dealStage?: string;
  }>;
}

async function CustomersContent({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const customers = await listCustomers({
    search: params.search,
    dealStage: params.dealStage,
  });
  return <CustomerTable customers={customers} />;
}

export default function CustomersPage({ searchParams }: CustomersPageProps) {
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Customers" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <Suspense>
            <CustomerSearch />
          </Suspense>
        </div>
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          }
        >
          <CustomersContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
