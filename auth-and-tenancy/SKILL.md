---
name: auth-and-tenancy
description: "Use when deciding or implementing tenancy for a Better Auth SaaS on Next.js and Cloudflare Workers with D1 and Drizzle, especially when the user asks to 'model multi-tenancy', 'add organisations', 'add teams', 'design memberships', 'choose user or organisation accounts', 'secure tenant data', or 'link Stripe billing to a tenant'. Do not use for standalone login screens or isolated Stripe webhook work without a tenancy decision."
---

# Auth and Tenancy

The headline decision: choose the tenant before you write the first product table.
The tenant is the thing that owns data, access, and the subscription.

## 1. Decide the tenant before writing a schema

Ask one question: **could two people ever need to share this data?**

- If no, make the person the tenant.
- If yes, model an organization from day one.

The UI can hide organizations at first. The data model cannot.
Create one organization for each early user if the product starts with one person.
That keeps later invitations and shared data inside the same ownership model.
For a person tenant, product rows and billing records use `userId`.
A single-user schema usually puts `userId` on every product row.
An organization retrofit must add `organizationId`, create default organizations, and backfill every row.
It must decide ownership for shared records and repair foreign keys, unique indexes, URLs, exports, and APIs.
It must rewrite queries and move Stripe customers and subscriptions to the new owner.
Ambiguous ownership makes the backfill a product decision, not a migration detail.
The work can require a long migration, dual reads, and a support plan.
Do not choose a person tenant because the first screen has one account.
Choose it only when shared ownership is outside the product's future.

## 2. The data model

Better Auth's Organization plugin supports organizations, members, invitations, and roles.
It adds `organization`, `member`, and `invitation` tables.
Its schema includes optional `activeOrganizationId` on sessions.
Generate or manually apply the required session fields.
Read the [Better Auth Organization docs](https://better-auth.com/docs/plugins/organization) before generating migrations.
The minimal organization model is:
This shows the tenancy subset; Better Auth also needs its core `user`, `session`, `account`, and `verification` tables.

```sql
user                  -- Better Auth identity
organization(id, name, slug, created_at)
member(id, user_id, organization_id, role, created_at)
invitation(id, email, inviter_id, organization_id, role, status, expires_at, created_at)
document(id, organization_id, ...)
```
Add a unique `(user_id, organization_id)` membership key, a unique organization slug, and tenant foreign keys.
The `member` row is the forgotten table.
It joins a person to an organization and stores that person's role.
Without it, the product cannot represent one user in two organizations.
Do not put `organizationId` or `role` on `user`.

Every tenant-owned table gets a non-null `organizationId`.
Every tenant-scoped query filters on that value, without exception.
Include it in reads, updates, deletes, counts, search, exports, and uniqueness checks.
Apply the same boundary to queue jobs, cron work, R2 keys, and signed URLs.
Use `SELECT * FROM document WHERE organization_id = ? AND id = ?`.
`WHERE id = ?` alone is a cross-tenant data leak waiting to happen.
Use the organization ID in compound indexes and conflict checks too.
Keep Better Auth's generated schema and your app schema in one migration flow.
The [Drizzle adapter docs](https://better-auth.com/docs/adapters/drizzle) require matching table names.
If you rename tables, pass the explicit schema mapping.
Generate the schema and Drizzle migration, then inspect its SQL before applying it to D1.

## 3. Resolve the tenant from the session

The classic multi-tenant bug has this shape:
1. The browser sends `organizationId`.
2. The server uses it without checking membership.
3. One customer reads or changes another customer's row.

Never trust a tenant ID from the client.
Resolve the signed-in user from the Better Auth session on the server.
Resolve the requested organization from the session's active organization or route context.
An active organization selector is context, not proof of access.
Then query `member` for both `userId` and `organizationId`.
Reject the request when that membership does not exist.
The authorization sequence is: session identity → requested organization → membership → role → resource query.
The resource query still filters on `organizationId` after the membership check.
The check proves access; it does not scope a later query automatically.

Better Auth exposes `auth.api.getSession` and `auth.api.getActiveMember`.
Use them with request headers, not a browser-supplied user object.
See [session management](https://better-auth.com/docs/concepts/session-management) and [Organization access control](https://better-auth.com/docs/plugins/organization).

## 4. Keep roles small

Start with three roles: `owner`, `admin`, and `member`.
- `owner` controls the organization and its ownership.
- `admin` manages members and product settings.
- `member` uses the shared product data.

Better Auth defines these default roles.
Its default `admin` cannot delete the organization or change the owner.
Its default `member` cannot create, update, or delete organization resources.
Attach a role check to the server action and the resource operation.
Do not attach it only to a hidden button or disabled form.
Check the role after membership and before the mutation.
Keep role names separate from subscription plans.
An organization's plan may limit features, but it does not prove a user's permission.

Do not create custom roles for hypothetical future needs.
Add a permission only when a real product action needs a different boundary.
Use Better Auth's access control APIs for custom permissions, and test them on the server.

## 5. Choose auth methods by support cost

Email OTP and magic links reduce password friction.
They make email delivery, expiry, rate limits, and mailbox access part of account security.
They create support cases for delayed mail, blocked links, and wrong inboxes.
Better Auth's [Email OTP plugin](https://better-auth.com/docs/plugins/email-otp) uses `sendVerificationOTP`.
Its documented defaults are six digits, five minutes, and three attempts.

The [Magic Link plugin](https://better-auth.com/docs/plugins/magic-link) uses `sendMagicLink`.
Its documented link expiry is five minutes.
Treat the link as a login credential.
Passwords add signup and reset friction, reduce delivery dependence, and create reset, reuse, breach, and support work.

OAuth reduces typing but adds provider setup, callback failures, outages, identity linking, and email trust decisions.
Better Auth supports built-in OAuth and OpenID Connect providers.
Do not treat a provider email claim as a membership grant.
Choose one primary path and one recovery path first.
Ask whether each method shortens time to the first useful action.
Use [user-onboarding](../user-onboarding/SKILL.md) for that friction question.

## 6. Invitations and their edge cases

An invitation is an organization action, not a user-profile field.
Store its target email, organization, inviter, role, status, and expiry.
Make acceptance require an authenticated session whose email matches the invitation.
For an existing user, accept the invitation and create the membership row.
Do not create a second user account.
Better Auth documents `auth.api.createInvitation`, `auth.api.acceptInvitation`, and `auth.api.cancelInvitation`.
The invitation email must carry the invitation ID, and acceptance must run after login.
For a signup with a different email, stop acceptance.
Do not match on display name, browser, or a client-supplied user ID.
Offer a change-email or resend path with a new invitation.
Better Auth checks the session email against the invitation in its normal flow.
Use `requireEmailVerificationOnInvitation: true` when the invitation ID can leak or email proof must be stronger.
If the inviter leaves, do not leave a live invitation owned by that account.
Cancel it, or transfer responsibility to an active owner or admin.
Notify the recipient when the invitation becomes invalid.
Define a last-owner transfer rule before allowing owner departure.
Better Auth cancels an invitation when the target is already a member.
It does not resend an existing invitation unless `resend` is true.
Test duplicate, expired, canceled, and concurrent invitations.

## 7. Put billing at the tenant boundary

If the paying customer is an organization, the subscription belongs to it.
Keep Stripe customer and subscription IDs in a billing record keyed by `organizationId`.
Attaching billing to a user breaks when that user belongs to two organizations.
It makes a teammate's plan control the wrong workspace and prevents clean transfers, seats, and cancellation.

The browser can identify a plan key.
The server must resolve the organization, authorize the action, select the Stripe customer and price, and update entitlements from webhooks.

Read [saas-billing-stripe](../saas-billing-stripe/SKILL.md) for Checkout, webhook, access, and portal rules.
Adapt its local user mapping to the organization when this skill chooses organization tenancy.
Keep billing state separate from membership state: membership answers who may enter, and billing answers what the organization may use.

## 8. Sessions and role changes

A session proves identity, not current organization membership or role.
Query membership during protected server work.
Do not copy a role into a long-lived client token and trust it later.
Better Auth sessions expire after seven days by default and extend after `updateAge`, which defaults to one day.
Set `expiresIn`, `updateAge`, and `freshAge` for the product's risk.
Use shorter freshness windows for owner actions and billing changes.
See [Better Auth session expiration](https://better-auth.com/docs/concepts/session-management).
Make role removal effective on the next authorization check.
Revoke sessions after membership changes when immediate logout is required.
For administrator removal, use `auth.api.revokeUserSessions` from the [Better Auth Admin plugin](https://better-auth.com/docs/plugins/admin).

“Log out everywhere” means server-side revocation for every active session.
Clearing one browser cookie does not end sessions on other devices.
Better Auth provides `revokeSessions` for this purpose.
If `session.cookieCache` is enabled, revocation can wait until its cache expires on another device.
Disable it for sensitive actions, or set a short cache age.
Do not promise immediate revocation while allowing a long cached session.

## Checklist

1. Ask whether two people may ever share the product data.
2. Choose the person or organization as the tenant before writing product tables.
3. If the tenant is an organization, create `organizationId` on every tenant-owned table.
4. Model `member` as the user-to-organization authorization row.
5. Add uniqueness and foreign-key constraints that include the organization boundary.
6. Generate Better Auth's Organization schema and inspect the Drizzle migration for D1.
7. Resolve identity from the server session, then verify membership for the requested organization.
8. Filter every tenant query on `organizationId`, including reads, writes, counts, and exports.
9. Keep `owner`, `admin`, and `member` until a real permission boundary requires more.
10. Choose auth methods by time to value and email or password support cost.
11. Require the invited email to match the authenticated session before acceptance.
12. Define what happens to pending invitations when an inviter leaves.
13. Store the Stripe subscription against the paying tenant, not an incidental user.
14. Recheck membership and role after session lookup on every protected server operation.
15. Test two organizations sharing one user, cross-tenant IDs, role downgrade, member removal, and billing.
16. Set session expiry and freshness deliberately, and define “log out everywhere”.

## Related

- `build-from-template` — the scaffold this decision has to be made in, before
  the first schema lands.
- `saas-billing-stripe` — the subscription belongs to the tenant this skill
  defines, not to a user.
- `user-onboarding` — sign-up friction and invitations are the same surface.
- `ship-a-product` — where this sits in the build stage.
