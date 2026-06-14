import Link from "next/link";
import type { Customer } from "@/types/customer";
import { Badge } from "@/components/ui/Badge";

const statusVariant = {
  prospect: "warning",
  active: "success",
  churned: "default",
} as const;

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        No customers found. Add some in Notion.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-600">Name</th>
            <th className="px-4 py-3 font-medium text-gray-600">Company</th>
            <th className="px-4 py-3 font-medium text-gray-600">Email</th>
            <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 font-medium text-gray-600">Owner</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/customers/${c.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {c.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">{c.company}</td>
              <td className="px-4 py-3 text-gray-600">{c.email}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
              </td>
              <td className="px-4 py-3 text-gray-600">{c.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
