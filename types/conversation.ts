export type ConversationChannel = "email" | "slack" | "notion";
export type ConversationStatus = "open" | "closed";

export interface Conversation {
  id: string; // Notion page ID
  title: string;
  customerId: string;
  customerName: string;
  channel: ConversationChannel;
  externalId: string;
  snippet: string;
  lastMessageAt: string | null; // ISO string
  followUpFlag: boolean;
  followUpDueDate: string | null; // ISO string
  status: ConversationStatus;
  syncedAt: string | null;
}
