# Open Internships: connecting the Discord channel

The home page's **Open Internships** section shows the newest internships from
the `#job-oppurtunities` channel in the Queen's NSBE Hub Discord. A small
read-only bot reads the channel, and the site checks it about once an hour.

## What gets shown

Posts the way the presidents already write them work as-is. In a roundup post,
**each numbered internship becomes its own card**, and the ALL-CAPS heading
above it becomes the card's category:

```
CIVIL & STRUCTURAL ENGINEERING

2. Hatch – Structural Engineering Student
Location: Trail, BC
Start: January 2027
Pay: $26–$34/hour
Relevant programs: Civil Engineering, particularly structural engineering.
Official application:
https://jobs.hatch.com/job/...
```

- The numbered line (`2. Hatch – Structural Engineering Student`) is the title.
- `Location:`, `Pay:`, and `Term:` or `Start:` lines show as details on the card.
- `Relevant programs:` shows as "For …".
- `Deadline:` (or "Due", "Closes", "Apply by") shows as a gold "Due …" tag.
- The first link under the item is the **Apply** button. An item with no link
  is skipped.

A one-off post that isn't numbered also works: it becomes one card titled by
its first line, using its first link.

Only posts from the last 45 days count, newest first. The home page shows the
3 newest as cards, with a "See all open internships" box under them that links
to the Discord. That box appears once an invite link is set as `discord` in
`src/socials.ts` (an invite set to never expire). If nothing qualifies, or the
bot isn't set up, the whole section hides itself.

## One-time setup (about 10 minutes)

Adding the bot to the server needs the **Manage Server** permission. To check
whether you have it, click **Queen's NSBE Hub ▾**: if you see **Server
Settings** and can open **Integrations**, you do. If not, do steps 1–2
yourself and send the link from step 3 to a server admin (for example a
Co-President).

1. **Create the bot.** Go to <https://discord.com/developers/applications>,
   click **New Application**, and name it something like
   `NSBE Queen's Website`.

2. **Set up the bot.** Open the **Bot** tab on the left.
   - Click **Reset Token** and copy the token. Treat it like a password: don't
     paste it in Discord, a document, or the code. You'll put it in Vercel in
     step 5.
   - Under **Privileged Gateway Intents**, turn on **Message Content Intent**
     and click **Save Changes**. Without this the bot sees posts but not their
     text.
   - Turn off **Public Bot** and save, so no one else can add it to their
     server.

3. **Add the bot to the server.** You need the invite link.
   - Open the **General Information** tab and copy the **Application ID**
     (a long number).
   - Put it into this link in place of `APPLICATION_ID`:

     ```
     https://discord.com/oauth2/authorize?client_id=APPLICATION_ID&scope=bot&permissions=66560
     ```

     `permissions=66560` means **View Channels** and **Read Message History**
     only. The bot can't post, delete, or moderate anything.
   - Open that link in your browser while logged in to Discord, pick
     **Queen's NSBE Hub** from the server list, and click **Authorize**. If
     the server isn't in the list, you don't have Manage Server: send the link
     to an admin to open instead.

   (Discord can also build this link for you: **OAuth2** tab → **OAuth2 URL
   Generator** → tick `bot` → under Bot Permissions tick **View Channels** and
   **Read Message History** → the **Generated URL** appears at the bottom with
   a Copy button.)

4. **Limit it to the internships channel** (recommended). The bot joins with
   its own role, named after the bot.
   - **Server Settings → Roles** → the bot's role → **Permissions** → turn off
     **View Channels**.
   - Right-click **#job-oppurtunities** → **Edit Channel → Permissions** →
     **Add members or roles** → the bot's role → allow **View Channel** and
     **Read Message History**.

5. **Give the website the token.** In Vercel, open the project → **Settings →
   Environment Variables** and add:
   - `DISCORD_BOT_TOKEN`: the token from step 2
   - `DISCORD_INTERNSHIPS_CHANNEL_ID`: the channel's ID. Turn on **User Settings
     → Advanced → Developer Mode**, then right-click **#job-oppurtunities →
     Copy Channel ID**. It should be `1367976256137723966`.

   Then redeploy (Deployments → ⋯ → Redeploy).

6. **Check it.** Visit `https://queensnsbe.ca/api/internships.json`. You
   should see the latest internships. The home page section appears below the
   Mentorship section.

To test locally, put the same two lines in `.env` (never commit that file) and
restart the dev server. Without them, the local dev server shows three sample
cards marked "Sample postings", and the live site hides the section.

## How it works

- `src/lib/internships.ts` fetches the channel and turns messages into cards.
- `src/pages/api/internships.json.ts` serves them. Vercel's CDN caches the
  answer for an hour (`s-maxage=3600`), so Discord is asked at most about once
  an hour however many people visit, and a new post shows up within an hour.
- The home page (`src/pages/index.astro`) loads that file in the browser, so
  the rest of the page stays fully static and fast.
