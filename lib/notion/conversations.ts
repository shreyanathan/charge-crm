import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints/common";
import type { Conversation, ConversationStatus, ConversationTalkStatus } from "@/types/conversation";
import { getNotionClient } from "./client";

const DB_ID = process.env.NOTION_CONVERSATIONS_DB_ID!;

function pageToConversation(page: PageObjectResponse): Conversation {
  const props = page.properties as Record<string, any>;

  return {
    id: page.id,
    title: props["Title / Subject"]?.title?.[0]?.plain_text ?? "",
    customerId: props.Customer?.relation?.[0]?.id ?? "",
    customerName: "",
    customerCompany: "",
    customerDealStage: "",
    customerOwner: "",
    externalId: props["External ID"]?.rich_text?.[0]?.plain_text ?? "",
    snippet: props.Snippet?.rich_text?.[0]?.plain_text ?? "",
    lastMessageAt: props["Last Message At"]?.date?.start ?? null,
    lastRepliedAt: props["Last Replied At"]?.date?.start ?? null,
    conversationStatus: (props["Conversation Status"]?.select?.name ?? "waiting_on_us") as ConversationTalkStatus,
    followUpFlag: props["Follow Up Flag"]?.checkbox ?? false,
    followUpAction: props["Follow Up Action"]?.rich_text?.[0]?.plain_text ?? "",
    status: (props.Status?.select?.name ?? "open") as ConversationStatus,
    syncedAt: props["Synced At"]?.date?.start ?? null,
  };
}

export async function listConversations(opts?: {
  customerId?: string;
  followUpOnly?: boolean;
  conversationStatus?: string;
  status?: string;
}): Promise<Conversation[]> {
  const notion = getNotionClient();
  const filter: any[] = [];

  if (opts?.customerId) {
    filter.push({ property: "Customer", relation: { contains: opts.customerId } });
  }
  if (opts?.followUpOnly) {
    filter.push({ property: "Follow Up Flag", checkbox: { equals: true } });
  }
  if (opts?.conversationStatus) {
    filter.push({ property: "Conversation Status", select: { equals: opts.conversationStatus } });
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
  followUpAction: string
): Promise<Conversation> {
  const notion = getNotionClient();
  const page = await notion.pages.update({
    page_id: id,
    properties: {
      "Follow Up Flag": { checkbox: followUpFlag },
      "Follow Up Action": {
        rich_text: followUpAction ? [{ text: { content: followUpAction } }] : [],
      },
    },
  });
  return pageToConversation(page as PageObjectResponse);
}

export async function updateConversationStatus(
  id: string,
  conversationStatus: ConversationTalkStatus
): Promise<Conversation> {
  const notion = getNotionClient();
  const page = await notion.pages.update({
    page_id: id,
    properties: {
      "Conversation Status": { select: { name: conversationStatus } },
    },
  });
  return pageToConversation(page as PageObjectResponse);
}

export async function upsertConversation(data: {
  title: string;
  customerId: string;
  externalId: string;
  snippet: string;
  lastMessageAt: string;
  lastRepliedAt: string | null;
  conversationStatus: ConversationTalkStatus;
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
    "External ID": { rich_text: [{ text: { content: data.externalId } }] },
    Snippet: { rich_text: [{ text: { content: data.snippet.slice(0, 150) } }] },
    "Last Message At": { date: { start: data.lastMessageAt } },
    "Last Replied At": data.lastRepliedAt
      ? { date: { start: data.lastRepliedAt } }
      : { date: null },
    "Synced At": { date: { start: new Date().toISOString() } },
  };

  if (existing.results.length > 0) {
    // Preserve existing conversationStatus if manually set — only update if it changed
    // (we always overwrite with auto-detected status on sync)
    await notion.pages.update({
      page_id: existing.results[0].id,
      properties: {
        ...props,
        "Conversation Status": { select: { name: data.conversationStatus } },
      },
    });
  } else {
    await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: {
        ...props,
        "Conversation Status": { select: { name: data.conversationStatus } },
        Status: { select: { name: "open" } },
        "Follow Up Flag": { checkbox: false },
      },
    });
  }
}
