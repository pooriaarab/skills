---
name: reddit
description: "Use when the user wants a Reddit data copy — posts, comments, votes, saved items, or the GDPR/CCPA archive. Triggers: 'download my Reddit data', 'Reddit data request', 'export Reddit votes', 'saved posts archive'."
---

# Reddit data request

Request the official copy from Settings. The zip includes saved posts,
comments, and voting history. That mix is unusually revealing.

Parent argument: [data-exports](../SKILL.md).

## Request URL

https://www.reddit.com/settings/data-request

Official: use a **computer** web browser.

Official help: [How do I request a copy of my Reddit data and information?](https://support.reddithelp.com/hc/en-us/articles/360043048352-How-do-I-request-a-copy-of-my-Reddit-data-and-information).

File map: [What's in my Reddit data copy?](https://support.reddithelp.com/hc/en-us/p/what_is_in_my_reddit_data_copy).

No account access: email redditdatarequests@reddit.com from the
verified address on the account.

## Submit

1. Sign in at reddit.com. Stop. The owner signs in.
2. Open the Request URL. Follow the form. Click **Submit**.

**Rate limit:** official help does not publish a cooldown between
requests. It does publish a **30-day** prepare window.

UNVERIFIED: third-party guides say one archive every 30 days. If the
form refuses a second request, wait.

## What it contains

ZIP of CSV. Official files appear only when Reddit holds that data.

| File | Holds |
|---|---|
| `posts.csv` / `comments.csv` | Everything you published |
| `saved_posts.csv` / `saved_comments.csv` | Saved items |
| `post_votes.csv` / `comment_votes.csv` | Votes on **other** users' content. **Not listed by date** |
| `messages.csv` / `chat_history.csv` | Private messages; 1:1, group, and subreddit chats |
| `subscribed_subreddits.csv` | Joined communities |
| `ip_logs.csv` | IPs. Except the signup IP, Reddit deletes collected IPs after **100 days** |
| `statistics.csv` | Account name, registration date, email if any |

Also: hidden posts, drafts, purchases, friends, moderated subs,
preferences, linked identities, phone, birthdate. The zip is the
portable copy. Some of this is also visible in the account.

## What it does not

- Other people's private data.
- Vote rows in date order. Official: vote files are not listed by date.
- IPs older than 100 days, other than the signup IP.
- Data after you delete the account. Request first.

## Delivery

Up to **30 days**. Official: a Reddit **inbox** notification with a
download link. Sometimes the verified account email instead.

## Format

ZIP of CSV. `checkfile.csv` holds hashes of the other file names.

## Gotchas

- **Desktop form.** Official.
- **Inbox, not only email.** Watch Reddit messages.
- **Votes have no dates.** Do not treat those CSVs as a timeline.
- **No polling.** The owner submits. The agent does not.

## Sources

- https://www.reddit.com/settings/data-request
- https://support.reddithelp.com/hc/en-us/articles/360043048352-How-do-I-request-a-copy-of-my-Reddit-data-and-information
- https://support.reddithelp.com/hc/en-us/p/what_is_in_my_reddit_data_copy
