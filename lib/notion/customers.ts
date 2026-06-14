import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints/common";
import type { Customer } from "@/types/customer";
import { getNotionClient } from "./client";

const DB_ID = process.env.NOTION_CUSTOMERS_DB_ID!;

function pageToCustomer(page: PageObjectResponse): Customer {
  const props = page.properties as Record<string, any>;

  return {
    id: page.id,
    name: props.Name?.title?.[0]?.plain_text ?? "",
    company: props.Company?.rich_text?.[0]?.plain_text ?? "",
    email: props.Email?.email ?? "",
    slackUserId: props["Slack User ID"]?.rich_text?.[0]?.plain_text ?? "",
    status: props.Status?.select?.name ?? "prospect",
    owner: props.Owner?.people?.[0]?.name ?? "",
    notes: props.Notes?.rich_text?.[0]?.plain_text ?? "",
  };
}

export async function listCustomers(opts?: {
  search?: string;
  status?: string;
}): Promise<Customer[]> {
  const notion = getNotionClient();
  const filter: any[] = [];

  if (opts?.status) {
    filter.push({ property: "Status", select: { equals: opts.status } });
  }

  if (opts?.search) {
    filter.push({
      or: [
        { property: "Name", title: { contains: opts.search } },
        { property: "Company", rich_text: { contains: opts.search } },
        { property: "Email", email: { contains: opts.search } },
      ],
    });
  }

  const response = await notion.dataSources.query({
    data_source_id: DB_ID,
    ...(filter.length > 0
      ? { filter: filter.length === 1 ? filter[0] : { and: filter } }
      : {}),
    sorts: [{ property: "Name", direction: "ascending" }],
  });

  return (response.results as PageObjectResponse[])
    .filter((r) => r.object === "page")
    .map(pageToCustomer);
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const notion = getNotionClient();
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    return pageToCustomer(page as PageObjectResponse);
  } catch {
    return null;
  }
}
