export interface GmailThread {
  threadId: string;
  subject: string;
  snippet: string;
  lastMessageAt: string;
  messageCount: number;
  from: string;
}

export interface SlackMessage {
  ts: string;
  channelId: string;
  text: string;
  userId: string;
  username: string;
  timestamp: string;
}

export interface NotionMention {
  pageId: string;
  title: string;
  snippet: string;
  lastEditedAt: string;
  url: string;
}
