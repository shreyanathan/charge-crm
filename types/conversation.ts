export type ConversationStatus = "open" | "closed";
export type ConversationTalkStatus = "waiting_on_us" | "waiting_on_them";

export interface Conversation {
  id: string; // Notion page ID
  title: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerDealStage: string;
  customerOwner: string;
  externalId: string;
  snippet: string;
  lastMessageAt: string | null; // ISO string
  lastRepliedAt: string | null; // When we last sent a message
  conversationStatus: ConversationTalkStatus;
  followUpFlag: boolean;
  followUpAction: string; // e.g. "Review NDA draft", "Write case study"
  status: ConversationStatus;
  syncedAt: string | null;
}
