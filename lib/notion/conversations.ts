import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints/common";
import type { Conversation, ConversationChannel, ConversationStatus } from "@/types/conversation";
import { getNotionClient } from "./client";

const DB_ID = process.env.NOTION_CONVERSATIONS_DB_ID!;

function pageToConversation(page: PageObjectResponse): Conversation {
  const props = page.properties as Record<string, any>;

  return {
    id: page.id,
    title: props["Title / Subject"]?.title?.[0]?.plain_text ?? "",
    customerId: props.Customer?.relation?.[0]?.id ?? "",
    customerName: "",
    channel: (props.Channel?.select?.name ?? "email") as ConversationChannel,
    externalId: props["External ID"]?.rich_text?.[0]?.plain_text ?? "",
    snippet: props.Snippet?.rich_text?.[0]?.plain_text ?? "",
    lastMessageAt: props["Last Message At"]?.date?.start ?? null,
    followUpFlag: props["Follow Up Flag"]?.checkbox ?? false,
    followUpDueDate: props["Follow Up Due Date"]?.date?.start ?? null,
    status: (props.Status?.select?.name ?? "open") as ConversationStatus,
    syncedAt: props["Synced At"]?.date?.start ?? null,
  };
}

export async function listConversations(opts?: {
  channel?: string;
  customerId?: string;
  needsReply?: boolean;
  status?: string;
}): Promise<Conversation[]> {
  const notion = getNotionClient();
  const filter: any[] = [];

  if (opts?.channel) {
    filter.push({ property: "Channel", select: { equals: opts.channel } });
  }
  if (opts?.customerId) {
    filter.push({ property: "Customer", relation: { contains: opts.customerId } });
  }
  if (opts?.needsReply) {
    filter.push({ property: "Follow Up Flag", checkbox: { equals: true } });
  }
  if (opts?.status) {
    filter.push({ property: "Status", select: { equals: opts.status } });
  }

  const response = await notion.dataSources.query({
    data_source_id: DB_ID,
    ...(filter.length > 0
      ? { filter: filter.length === 1 ? filter[0] : { and: filter } }
      : {}),
    sorts: [{ property: "Last Message At", direction: "descending" }],
  });

  return (response.results as PageObjectResponse[])
    .filter((r) => r.object === "page")
    .map(pageToConversation);
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const notion = getNotionClient();
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    return pageToConversation(page as PageObjectResponse);
  } catch {
    return null;
  }
}

export async function updateFollowUp(
  id: string,
  followUpFlag: boolean,
  followUpDueDate: string | null
): Promise<Conversation> {
  const notion = getNotionClient();
  const page = await notion.pages.update({
    page_id: id,
    properties: {
      "Follow Up Flag": { checkbox: followUpFlag },
      "Follow Up Due Date": followUpDueDate
        ? { date: { start: followUpDueDate } }
        : { date: null },
    },
  });
  return pageToConversation(page as PageObjectResponse);
}

export async function upsertConversation(data: {
  title: string;
  customerId: string;
  channel: ConversationChannel;
  externalId: string;
  snippet: string;
  lastMessageAt: string;
}): Promise<void> {
  const notion = getNotionClient();

  // Check if exists by externalId
  const existing = await notion.dataSources.query({
    data_source_id: DB_ID,
    filter: {
      property: "External ID",
      rich_text: { equals: data.externalId },
    },
  });

  const props: Record<string, any> = {
    "Title / Subject": { title: [{ text: { content: data.title } }] },
    Customer: { relation: [{ id: data.customerId }] },
    Channel: { select: { name: data.channel } },
    "External ID": { rich_text: [{ text: { content: data.externalId } }] },
    Snippet: { rich_text: [{ text: { content: data.snippet.slice(0, 150) } }] },
    "Last Message At": { date: { start: data.lastMessageAt } },
    "Synced At": { date: { start: new Date().toISOString() } },
  };

  if (existing.results.length > 0) {
    await notion.pages.update({
      page_id: existing.results[0].id,
      properties: props,
    });
  } else {
    await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: {
        ...props,
        Status: { select: { name: "open" } },
        "Follow Up Flag": { checkbox: false },
      },
    });
  }
}
