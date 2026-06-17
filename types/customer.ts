export type DealStage = "NDA" | "LOI" | "Contract" | "Closed/Won" | "Stale";

export interface Customer {
  id: string; // Notion page ID
  name: string;
  company: string;
  email: string;
  dealStage: DealStage;
  owner: string;
  notes: string;
}
