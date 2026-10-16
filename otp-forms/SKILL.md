---
name: otp-forms
description: "Build a one-time code (OTP) entry form that users can fill in one tap. Use when a login, signup, or verify step asks for a 4 to 8 digit code from email or SMS, or when you review such a form. Covers the single-input contract, paste and autofill, the origin-bound SMS format, and the WebOTP API."
---

# otp-forms

A code form has one job. The user gets a code. The user enters the code. Each
app switch loses users. Each extra field loses more users. Build the form so
the system fills the code and the user only confirms it.

Source: web.dev, SMS OTP form best practices. The Modern Web Guidance set
(goo.gle/mwg) holds the same rule for coding agents.

## The input contract

Use one input for the full code. Do not split the code into one box per digit.
Split boxes break autofill, break paste in some browsers, and force arrow-key
logic that a single field gives free.

Set these attributes on the input:

- `type="text"`. Never use `type="number"`. Never use `type="tel"`.
- `inputmode="numeric"`. This attribute opens the number keyboard.
- `pattern="[0-9]*"`. This attribute helps iOS show the right keyboard.
- `autocomplete="one-time-code"`. This attribute lets iOS, macOS, and Android
  suggest the code from the message.
- `maxlength` set to the code length the server sends.
- `autocapitalize="none"`, `autocorrect="off"`, `spellcheck="false"`.

Give the input a real label. Link the error text with `aria-describedby`.
Put the error in a `role="alert"` node. Focus the input when the form opens.

## The behavior contract

- Accept a pasted code in one action. Paste must fill the full code.
- Strip spaces and hyphens from pasted and typed values.
- Do not block paste. Do not block the password manager.
- Submit the form at once when the code is complete. Guard the submit so a
  double tap sends one request.
- Keep a manual submit button. Auto-submit is a help, not the only path.
- Keep the verify call server-side. The client sends the code once.
- Show the target account. Write "We sent a code to a@b.com" above the form.
- Give a resend action. Disable resend for a short count, then enable it.
- Keep the code length in one server constant. The form reads that length.

## The email text

Put the code in plain text. State the site name and the expiry time. Put the
code where a mail client preview shows it. Keep any magic link in the same
mail, below the code. Write one code per mail. A new mail kills the old code.

```text
Subject: Your Acme code is 123456

Your Acme sign-in code is 123456. The code expires in 10 minutes.
Enter the code at acme.example to sign in.
If you did not ask for this code, ignore this mail.
```

## The SMS text and WebOTP

Add this step only when the product sends SMS. End the SMS with one last line.
The line holds the domain and the code in this form:

```text
Your Acme code is 123456. The code expires in 10 minutes.

@acme.example #123456
```

The `@domain` part binds the code to one origin. A phishing site on a second
domain gets no autofill. The `#code` part marks the code for the parser.

On Android Chrome, read the SMS with the WebOTP API. Call
`navigator.credentials.get({ otp: { transport: ["sms"] } })` when the form
opens. Fill the input with the returned code, then submit. Abort the call
when the user submits by hand. The API needs a secure origin and one user
grant. On iOS and macOS Safari, `autocomplete="one-time-code"` plus the SMS
format gives the one-tap suggestion. No extra code is needed there.

## Security limits

A code is a shared secret. A user can read the code aloud to an attacker.
Prefer passkeys for sign-in when the product can support them. Use a code as
the fallback path, not the only path. Rate-limit sends and checks on the
server. Expire codes fast. Send one code at a time per account.

## Check before you ship

- Grep the form for `one-time-code`. One input must hold that value.
- Paste a full code with spaces. The form must accept it in one action.
- Type the code on a phone keyboard. The keyboard must show numbers only.
- Read the SMS text. The last line must match `@domain #code`.
- Test with a code from a second domain. The browser must not suggest it.
- Run the auth E2E spec. Save the spec result as the proof artifact.
