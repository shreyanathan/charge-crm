import type { ConversationChannel } from "@/types/conversation";

export function channelLabel(channel: ConversationChannel): string {
  return { email: "Email", slack: "Slack", notion: "Notion" }[channel];
}

export function channelColor(channel: ConversationChannel): string {
  return {
    email: "bg-blue-100 text-blue-700",
    slack: "bg-purple-100 text-purple-700",
    notion: "bg-gray-100 text-gray-700",
  }[channel];
}
