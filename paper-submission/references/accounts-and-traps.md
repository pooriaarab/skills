# Accounts and traps

Checked 2026-10-16 by creating the accounts for an independent author.

## One account per service

arXiv, ORCID and Google Scholar ban a second account for one person. arXiv
says so on the sign-up page. Do not make an account per paper. Give each paper
its own contact alias on the manuscript instead (a forwarding address on your
own domain), and keep one login per service.

## arXiv

- **Password:** letters, digits and underscores only. A `!` is rejected.
- **Sign-up check:** a digit image. The account owner types it. An agent
  must not solve it.
- **Step 2:** name, affiliation ("Independent Researcher" is accepted),
  country, status, group, default category. Country must be true: arXiv may
  suspend an account for a false identity.
- **Verify:** arXiv emails a link and a 12-character code to the address you
  gave. Read the mail, open the link.
- **Link ORCID** on the account page. The ORCID prompt asks only to read your
  iD (`/authenticate`).
- **Endorsement:** starting a submission and choosing the category (for
  example cs.AI) makes arXiv email a six-character code to you. An endorser
  logs in, opens `https://arxiv.org/auth/endorse?x=<code>` and chooses
  endorse or do not endorse. The endorser must have submitted at least 3
  papers to cs categories more than 3 months and less than 5 years ago. Ask one
  person who knows your work. Do not mass-send, pay, or post a public call.
- **Submission Agreement:** the account owner accepts it. The page opens it in
  a pop-up. The accept button stays disabled until the pop-up is scrolled.
  Choose a licence (CC BY 4.0 is the usual choice for a paper).
- **Limit:** 2 new submissions per calendar month per account.

## ORCID

Sign in is OAuth from other sites. Read the scope on the prompt. `/authenticate`
only reads the iD. `/person/update` and `/activities/update` let the other site
write to the record. Grant that only when the owner approves.

## Zenodo

- An account created through GitHub has no password. Use "Forgot password" with
  the account email. Then you can log in with email and password in a browser
  that has no GitHub login.
- Create a personal access token with `deposit:write` and `deposit:actions`.
  Keep it in a 0600 file outside any git repo.
- The GitHub page lists your repos with switches. Switch on the repos, then
  publish a GitHub release for each. A DOI appears in a few minutes.
- A release also archives the whole repo. Do not publish a release of a
  repo with secrets.
- Zenodo says Google Scholar does not index Zenodo. A Zenodo DOI helps
  citation, not Scholar.

## Google Scholar

Scholar has no submit form. A profile needs at least one article before the
setup wizard continues, and group matches for your name belong to other
people: do not tick them. Wait for the arXiv paper, then add it by title.

## Automating the browser

- A copy of your own Chrome profile does not carry logins you made after the
  copy. On macOS the sync can fail with "Operation not permitted" because the
  system blocks reading the Chrome profile. Use a password reset or OAuth
  instead.
- `click @ref` often does nothing and still prints Done. Use a page script that
  calls `.click()`, then read the page to confirm.
- Custom select widgets need the change event and a widget refresh.
- Pass a password through the environment. Never print it. Save logins in a
  0600 file outside git.

## Reading the verification mail

If the alias forwards to a Gmail inbox, read the message body with a Gmail
command that returns bodies. Search by sender and time, then fetch by id.
