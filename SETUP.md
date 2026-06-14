# CRM Inbox — Setup Guide

## 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

### Google OAuth (SSO)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials → Web application
3. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOWED_GOOGLE_DOMAIN`

### Gmail Service Account (read emails)
1. Create a Service Account in Google Cloud Console
2. Enable domain-wide delegation on the service account
3. In Google Admin > Security > API controls, add the service account with scope `https://www.googleapis.com/auth/gmail.readonly`
4. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `GMAIL_IMPERSONATE_EMAIL`

### Notion
1. Create a [Notion integration](https://www.notion.so/my-integrations)
2. Create the two databases (see schema below), share them with your integration
3. Set `NOTION_API_KEY`, `NOTION_CUSTOMERS_DB_ID`, `NOTION_CONVERSATIONS_DB_ID`

### Slack
1. Create a Slack App at [api.slack.com](https://api.slack.com/apps)
2. Add Bot Token scopes: `channels:history`, `im:history`, `im:read`, `users:read`
3. Install to workspace, copy the Bot Token
4. Set `SLACK_BOT_TOKEN`, `SLACK_SUPPORT_CHANNEL_ID`

## 2. Notion Database Schema

### Customers DB
| Property | Type |
|---|---|
| Name | Title |
| Company | Text |
| Email | Email |
| Slack User ID | Text |
| Status | Select: `prospect`, `active`, `churned` |
| Owner | Person |
| Notes | Text |

### Conversations DB
| Property | Type |
|---|---|
| Title / Subject | Title |
| Customer | Relation → Customers DB |
| Channel | Select: `email`, `slack`, `notion` |
| External ID | Text |
| Snippet | Text |
| Last Message At | Date |
| Follow Up Flag | Checkbox |
| Follow Up Due Date | Date |
| Status | Select: `open`, `closed` |
| Synced At | Date |

## 3. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to Google sign-in.

## 4. Sync data

Trigger a sync manually:
```bash
curl -X POST http://localhost:3000/api/sync \
  -H "Authorization: Bearer $CRON_SECRET"
```

Or sync a specific customer:
```bash
curl -X POST http://localhost:3000/api/sync \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"customerId": "NOTION_PAGE_ID"}'
```

## 5. Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add all env vars from `.env.example`
4. Vercel will automatically use `vercel.json` to run the sync cron every 15 minutes

> **Note:** Vercel Cron uses a GET request to `/api/sync` with `Authorization: Bearer <CRON_SECRET>`.
