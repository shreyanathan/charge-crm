export interface GmailThread {
  threadId: string;
  subject: string;
  snippet: string;
  lastMessageAt: string;
  lastRepliedAt: string | null; // timestamp of our last outbound message
  lastSenderEmail: string; // email of the sender of the last message
  participants: string[]; // all email addresses across all messages in thread
  messageCount: number;
}
