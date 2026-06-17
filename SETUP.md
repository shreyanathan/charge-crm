# CRM Inbox — Setup Guide

---

## 0. Create the `sales@` mailbox (do this first)

The CRM reads from a single shared `sales@yourcompany.com` mailbox. All customer email must flow through it.

### Step 1: Create the mailbox
1. In Google Workspace Admin → **Directory > Users**, create a new user: `sales@yourcompany.com`
2. Set a strong password and store it securely. The team doesn't need to log in interactively — this is a service account mailbox.

### Step 2: Route customer email through `sales@`

**For new threads going forward:**
- When starting a new customer conversation, send from `sales@` directly (log in via Gmail or set up a shared mailbox in your email client).
- Alternatively, each team member can CC or BCC `sales@` on every outbound customer email. Ask everyone to make this a habit.

**For existing threads in personal inboxes:**
To avoid threads falling through the cracks:
- Forward active threads to `sales@` (this creates a new thread — reply from sales@ to continue it, or just use it for tracking).
- Set up a Gmail filter in each team member's inbox: any email from a customer domain → auto-forward to `sales@`. This ensures anything new hitting personal inboxes also lands in sales@.

**How to set up auto-forward in Gmail:**
1. Open Gmail → Settings → See all settings → Forwarding and POP/IMAP
2. Add `sales@yourcompany.com` as a forwarding address and confirm it
3. Go to Filters and Blocked Addresses → Create a new filter
4. Filter: `from:(@customerdomain.com) OR to:(@customerdomain.com)` (repeat per customer domain)
5. Action: Forward to `sales@yourcompany.com`

> **Why this works:** The CRM syncs all threads in the `sales@` inbox and matches them to customers by email address. As long as threads land in `sales@`, nothing falls through the cracks.

---

## 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

### Google OAuth (SSO for team login)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials → Web application
3. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOWED_GOOGLE_DOMAIN`

### Gmail Service Account (reads `sales@` inbox)
1. In Google Cloud Console → IAM & Admin → Service Accounts, create a new service account
2. Create and download a JSON key for it
3. Enable **domain-wide delegation** on the service account:
   - Edit the service account → check "Enable Google Workspace Domain-wide Delegation"
   - Note the Client ID shown
4. In **Google Workspace Admin** → Security → API controls → Domain-wide Delegation:
   - Add the service account Client ID
   - Scope: `https://www.googleapis.com/auth/gmail.readonly`
5. Set environment variables:
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
   GMAIL_IMPERSONATE_EMAIL=sales@yourcompany.com
   ```

### Notion
1. Create a [Notion integration](https://www.notion.so/my-integrations) (Internal type)
2. Create the two databases (see schema below), share both with your integration
3. Set `NOTION_API_KEY`, `NOTION_CUSTOMERS_DB_ID`, `NOTION_CONVERSATIONS_DB_ID`

---

## 2. Notion Database Schema

### Customers DB
| Property | Type | Notes |
|---|---|---|
| Name | Title | Customer full name |
| Company | Text | Customer's company |
| Email | Email | Customer's email address (used for thread matching) |
| Deal Stage | Select | `NDA`, `LOI`, `Contract`, `Closed/Won`, `Stale` |
| Owner | Person | Assigned team member |
| Notes | Text | Free-form notes |

### Conversations DB
| Property | Type | Notes |
|---|---|---|
| Title / Subject | Title | Email subject line |
| Customer | Relation | → Customers DB |
| External ID | Text | Gmail thread ID (used for deduplication) |
| Snippet | Text | First 150 chars of latest message |
| Last Message At | Date | Timestamp of latest email in thread |
| Last Replied At | Date | When we last sent a message in this thread |
| Conversation Status | Select | `waiting_on_us`, `waiting_on_them` |
| Follow Up Flag | Checkbox | |
| Follow Up Action | Text | e.g. "Review NDA draft", "Write case study" |
| Status | Select | `open`, `closed` |
| Synced At | Date | |

---

## 3. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to Google sign-in.

---

## 4. Sync data

Trigger a manual sync (fetches all threads from `sales@` inbox and matches to customers):

```bash
curl -X POST http://localhost:3000/api/sync \
  -H "Authorization: Bearer $CRON_SECRET"
```

The sync will:
1. Fetch all thread participants' email addresses from the `sales@` inbox
2. Match threads to customers by email address
3. Auto-detect "Waiting on us vs them" from the last message sender's domain
4. Upsert conversations into Notion

**Vercel Cron** runs this automatically every 15 minutes via `vercel.json`.

---

## 5. Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add all env vars from `.env.example`
4. Vercel will automatically use `vercel.json` to run the sync cron every 15 minutes

> **Note:** Vercel Cron sends a GET request to `/api/sync` with `Authorization: Bearer <CRON_SECRET>`.

---

## 6. Team onboarding checklist

- [ ] `sales@` mailbox created in Google Workspace
- [ ] All team members have set up Gmail auto-forward filters for customer domains → `sales@`
- [ ] Team agrees to CC `sales@` on all new customer threads going forward
- [ ] Each customer record in Notion has the correct email address filled in (used for thread matching)
- [ ] Service account granted domain-wide delegation with `gmail.readonly` scope
- [ ] Notion databases created with the schema above and shared with the integration
- [ ] Env vars set in Vercel
- [ ] First manual sync triggered and conversations appearing in inbox
