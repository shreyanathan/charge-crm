import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints/common";
import type { Customer, DealStage } from "@/types/customer";
import { getNotionClient } from "./client";

const DB_ID = process.env.NOTION_CUSTOMERS_DB_ID!;

const VALID_STAGES: DealStage[] = ["NDA", "LOI", "Contract", "Closed/Won", "Stale"];

function pageToCustomer(page: PageObjectResponse): Customer {
  const props = page.properties as Record<string, any>;
  const rawStage = props["Deal Stage"]?.select?.name ?? "NDA";

  return {
    id: page.id,
    name: props.Name?.title?.[0]?.plain_text ?? "",
    company: props.Company?.rich_text?.[0]?.plain_text ?? "",
    email: props.Email?.email ?? "",
    dealStage: (VALID_STAGES.includes(rawStage) ? rawStage : "NDA") as DealStage,
    owner: props.Owner?.people?.[0]?.name ?? "",
    notes: props.Notes?.rich_text?.[0]?.plain_text ?? "",
  };
}

export async function listCustomers(opts?: {
  search?: string;
  dealStage?: string;
}): Promise<Customer[]> {
  const notion = getNotionClient();
  const filter: any[] = [];

  if (opts?.dealStage) {
    filter.push({ property: "Deal Stage", select: { equals: opts.dealStage } });
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

export async function updateDealStage(id: string, dealStage: DealStage): Promise<Customer> {
  const notion = getNotionClient();
  const page = await notion.pages.update({
    page_id: id,
    properties: {
      "Deal Stage": { select: { name: dealStage } },
    },
  });
  return pageToCustomer(page as PageObjectResponse);
}
