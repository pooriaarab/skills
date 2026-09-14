// The messages the warm-up actually sends.
//
// Two rules govern everything here. The mail must read like ordinary business
// correspondence, because that is the traffic we want the domain judged on. And
// it must vary in FORMAT as well as wording: a plain-text note and a note with
// an inline logo are filtered differently, so sending only one shape proves
// only that one shape is deliverable.

import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";

/** Format shapes, cheapest to richest. `report --by-variant` compares them. */
export const VARIANTS = ["plain", "html_simple", "html_logo", "html_rich", "newsletter"];

/**
 * "newsletter" is deliberately the shape real cold outreach takes: a broadcast
 * with a promotional block, an availability list and a numbered form. It is the
 * hardest shape to land and the one most likely to be filtered to Promotions,
 * so it is worth measuring on its own rather than assuming the 1:1 result
 * carries over. It is also the only shape here that is a commercial electronic
 * message, so it carries a List-Unsubscribe header and a physical identifier.
 */
const NEWSLETTER_INTROS = [
  "Good morning,",
  "Hello,",
  "Good afternoon,",
];

const SUBJECTS = [
  "Quick check on the {day} schedule",
  "Following up on the intake form",
  "Availability for the assessment next week",
  "Notes from our call",
  "Question about the file you sent",
  "Rescheduling the {day} appointment",
  "Confirming the report timeline",
  "Short update on the referral",
  "Paperwork for next week",
  "Checking in before {day}",
];

const OPENERS = [
  "Hi — just confirming we are still on for {day}.",
  "Hi — thanks for sending that over yesterday.",
  "Hi — following up on the note from last week.",
  "Hi — wanted to check one detail before we go ahead.",
  "Hi — quick question about the file you shared.",
  "Hi — circling back on the scheduling question.",
];

const MIDDLES = [
  "The afternoon slot looks easier on our side, but either works.",
  "I have put the paperwork together and it is ready when you are.",
  "Nothing urgent, I just want to make sure the dates line up.",
  "If the timing has moved, let me know and I will adjust.",
  "I can send the summary across once the times are settled.",
  "Let me know which option suits and I will confirm it.",
];

const CLOSERS = ["Thanks,", "Best,", "Cheers,", "Many thanks,"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const REPLIES = [
  "Thanks — that works on my end. See you then.",
  "Got it, thanks for confirming. Nothing else needed from me.",
  "Sounds good. The afternoon is better for me if that is still open.",
  "Thanks for the update. I will watch for the paperwork.",
  "That all looks right to me. Thanks for checking.",
  "Perfect, thanks. Let me know if anything shifts.",
];

const pick = (rng, list) => list[Math.floor(rng() * list.length) % list.length];

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/**
 * Read a logo once and hand it to compose(). Kept out of compose() so message
 * generation stays pure and testable without touching the filesystem.
 */
export async function loadLogo(path) {
  if (!path) return null;
  const buf = await readFile(path);
  const ext = extname(path).toLowerCase();
  const type = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif" }[ext];
  if (!type) throw new Error(`logo must be png, jpg or gif, got "${ext || path}"`);
  return { filename: basename(path), type, content: buf.toString("base64") };
}

function signatureText(fromName, domain) {
  return `${fromName}\n${domain}`;
}

/**
 * `variant` selects the format. Wording is drawn from the pools above so that
 * no two messages in a run are identical, which matters because identical
 * bodies at volume are themselves a bulk-mail signal.
 */
export function compose(rng, { fromName, fromAddress, toAddress, day, variant = "plain", logo = null, replyTo = null, orgName = null }) {
  const weekday = pick(rng, DAYS);
  const subject = pick(rng, SUBJECTS).replaceAll("{day}", weekday);
  const body = `${pick(rng, OPENERS).replaceAll("{day}", weekday)}\n\n${pick(rng, MIDDLES)}`;
  const closer = pick(rng, CLOSERS);
  const domain = String(fromAddress).split("@")[1] ?? "";
  const text = `${body}\n\n${closer}\n${signatureText(fromName, domain)}`;

  // A logo variant without a logo would silently send plain HTML and the
  // per-variant report would then compare two things that are the same.
  const useLogo = (variant === "html_logo" || variant === "html_rich") && logo;
  if ((variant === "html_logo" || variant === "html_rich") && !logo) {
    throw new Error(`variant "${variant}" needs a logo; set "logoPath" in the config`);
  }

  if (variant === "newsletter") {
    return composeNewsletter(rng, { fromName, fromAddress, replyAddress: replyTo, org: orgName ?? fromName });
  }
  if (variant === "plain") return { subject, text, html: null, attachments: [], headers: null, variant };

  const paras = body.split("\n\n").map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  const img = useLogo ? `<img src="cid:logo" alt="${escapeHtml(fromName)}" width="40" height="40" style="display:block;border:0">` : "";
  const attachments = useLogo
    ? [{ disposition: "inline", content_id: "logo", filename: logo.filename, type: logo.type, content: logo.content }]
    : [];

  let html;
  if (variant === "html_simple") {
    html = `<div>${paras}<p>${escapeHtml(closer)}<br>${escapeHtml(fromName)}<br>${escapeHtml(domain)}</p></div>`;
  } else if (variant === "html_logo") {
    html = `<div>${paras}<p>${escapeHtml(closer)}<br>${escapeHtml(fromName)}</p>${img}</div>`;
  } else {
    // html_rich is the heaviest shape we send: styled signature plus logo. If
    // anything gets filtered to Promotions, it is usually this one.
    html =
      `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px;color:#1f2933;line-height:1.5">` +
      `${paras}<p>${escapeHtml(closer)}</p>` +
      `<table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid #dfe3e8;padding-top:10px;margin-top:6px">` +
      `<tr><td style="padding-right:10px;vertical-align:middle">${img}</td>` +
      `<td style="vertical-align:middle"><div style="font-weight:600">${escapeHtml(fromName)}</div>` +
      `<div style="color:#52606d">${escapeHtml(domain)}</div></td></tr></table></div>`;
  }
  return { subject, text, html, attachments, headers: null, variant };
}

/** Availability rows read as a real scheduling broadcast rather than filler. */
function availabilityRows(rng) {
  const cities = ["Vancouver", "Surrey", "Burnaby", "Victoria", "Kelowna", "Richmond"];
  const kinds = ["Orthopaedic", "Psychiatric", "Neuropsychological", "Physiatry", "Occupational Medicine"];
  const rows = [];
  for (let i = 0; i < 4; i++) {
    const d = 3 + Math.floor(rng() * 25);
    rows.push({ date: `Oct ${d}`, city: pick(rng, cities), kind: pick(rng, kinds) });
  }
  return rows;
}

const REFERRAL_QUESTIONS = [
  "What is the reason for requiring an assessment?",
  "What is the nature of the individual's medical condition?",
  "Has the individual attended an assessment before, and if so when and with whom?",
  "What is the individual's occupation, and is it a safety sensitive role?",
  "Are they currently off work, and for how long?",
  "Does this file involve arbitration, and is a tribunal date set?",
];

function composeNewsletter(rng, { fromName, fromAddress, replyAddress, org }) {
  const domain = String(fromAddress).split("@")[1] ?? "";
  const rows = availabilityRows(rng);
  const reply = replyAddress ?? fromAddress;
  const subject = pick(rng, [
    "Upcoming assessment availability",
    "October availability and referral form",
    "Assessor availability for October",
    "This month's available appointments",
  ]);

  const textRows = rows.map((r) => `  ${r.date} — ${r.city} — ${r.kind}`).join("\n");
  const textQs = REFERRAL_QUESTIONS.map((q, i) => `  ${i + 1}. ${q}`).join("\n");
  const text =
    `${pick(rng, NEWSLETTER_INTROS)}\n\n` +
    `Please see below our upcoming available appointments. These dates are offered on a first come, first served basis. ` +
    `CVs and sample reports are available on request.\n\n` +
    `AVAILABLE APPOINTMENTS\n${textRows}\n\n` +
    `To book, reply to ${reply} with the following:\n\n${textQs}\n\n` +
    `Thank you for choosing ${org}.\n\n` +
    `${org}\n${domain}\n\nTo stop receiving these updates, reply with "unsubscribe".`;

  const htmlRows = rows
    .map((r) => `<tr><td style="padding:4px 12px 4px 0">${escapeHtml(r.date)}</td><td style="padding:4px 12px 4px 0">${escapeHtml(r.city)}</td><td style="padding:4px 0">${escapeHtml(r.kind)}</td></tr>`)
    .join("");
  const htmlQs = REFERRAL_QUESTIONS.map((q) => `<li style="margin-bottom:4px">${escapeHtml(q)}</li>`).join("");
  const html =
    `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px;color:#1f2933;line-height:1.5">` +
    `<p>${escapeHtml(pick(rng, NEWSLETTER_INTROS))}</p>` +
    `<p>Please see below our upcoming available appointments. These dates are offered on a first come, first served basis. CVs and sample reports are available on request.</p>` +
    `<h3 style="font-size:14px;margin:16px 0 6px">Available appointments</h3>` +
    `<table role="presentation" cellpadding="0" cellspacing="0">${htmlRows}</table>` +
    `<h3 style="font-size:14px;margin:16px 0 6px">To book</h3>` +
    `<p>Reply to ${escapeHtml(reply)} with the following:</p><ol style="padding-left:18px;margin:0">${htmlQs}</ol>` +
    `<p style="margin-top:16px">Thank you for choosing ${escapeHtml(org)}.</p>` +
    `<p style="color:#52606d;font-size:12px;border-top:1px solid #dfe3e8;padding-top:10px">` +
    `${escapeHtml(org)} &middot; ${escapeHtml(domain)}<br>` +
    `To stop receiving these updates, reply with &quot;unsubscribe&quot;.</p></div>`;

  // A bulk shape without List-Unsubscribe is filtered harder and, once this is
  // aimed at real recipients, is a CASL problem as well as a deliverability one.
  const headers = { "List-Unsubscribe": `<mailto:${reply}?subject=unsubscribe>` };
  return { subject, text, html, attachments: [], headers, variant: "newsletter" };
}

export function composeReply(rng) {
  return pick(rng, REPLIES);
}

/** Rotate deterministically so every identity exercises every shape over a run. */
export function variantFor(index, enabled = VARIANTS) {
  return enabled[index % enabled.length];
}
