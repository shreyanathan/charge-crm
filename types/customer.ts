export type CustomerStatus = "prospect" | "active" | "churned";

export interface Customer {
  id: string; // Notion page ID
  name: string;
  company: string;
  email: string;
  slackUserId: string;
  status: CustomerStatus;
  owner: string;
  notes: string;
}
