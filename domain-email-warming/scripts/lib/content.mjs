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
export const VARIANTS = ["plain", "html_simple", "html_logo", "html_rich", "attachment", "newsletter", "promo"];

/**
 * "newsletter" is deliberately the shape real cold outreach takes: a broadcast
 * with a promotional block, an availability list and a numbered form. It is the
 * one most likely to be filtered to Promotions among the 1:1 shapes, so it is
 * worth measuring on its own rather than assuming the 1:1 result carries over.
 * It is also a commercial electronic message, so it carries a List-Unsubscribe
 * header and an opt-out line. (A physical mailing address is also required for
 * real commercial mail under CASL/CAN-SPAM; this builder does not add one, so
 * callers sending this variant to real recipients must supply it themselves.)
 */
const NEWSLETTER_INTROS = [
  "Good morning,",
  "Hello,",
  "Good afternoon,",
];

const CLOSERS = [
  "Thanks,", "Best,", "Cheers,", "Many thanks,", "Thanks again,",
  "Appreciate it,", "Talk soon,", "Thanks so much,", "Warmly,", "All the best,",
];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/**
 * Message scenarios. Each one is a whole correspondence type with its own
 * subjects, openers and middles, so a message coheres end to end — a document
 * request never borrows a scheduling line. Variety lives at the scenario
 * level: receivers see different threads, not the same skeleton reworded.
 * {day} is filled with a weekday when the line calls for one.
 */
const SCENARIOS = [
  {
    subjects: [
      "Quick check on the {day} schedule",
      "Rescheduling the {day} appointment",
      "Confirming the {day} slot",
      "Are we still on for {day}?",
      "Moving our call to {day}",
      "{day} timing",
      "Free for a call {day}?",
      "Booking for {day}",
    ],
    openers: [
      "Hi — just confirming we are still on for {day}.",
      "Hi — wanted to check one detail before we go ahead.",
      "Hi — circling back on the scheduling question.",
      "Hello — quick check on our {day} slot.",
      "Hey — is {day} still good on your end?",
      "Hi — a small change on my side for {day}.",
      "Morning — checking the plan for {day}.",
      "Hi — following up on the note from last week.",
    ],
    middles: [
      "The afternoon slot looks easier on our side, but either works.",
      "If the timing has moved, let me know and I will adjust.",
      "Early afternoon is best here, but I can flex around it.",
      "Same time as last week is fine if that still works.",
      "I blocked the morning, so any time after lunch is easiest.",
      "Thirty minutes should cover it — we do not need the full hour.",
      "I can move things around if {day} is tight for you.",
      "Let me know which option suits and I will confirm it.",
    ],
  },
  {
    subjects: [
      "The file you asked for",
      "Document from our call",
      "Sending over the report",
      "Question about the file you sent",
      "Re: the paperwork",
      "Latest version of the summary",
      "The draft you wanted",
      "Quick look at the attachment?",
    ],
    openers: [
      "Hi — thanks for sending that over yesterday.",
      "Hi — quick question about the file you shared.",
      "Hi — the document you asked for is ready.",
      "Hello — passing along the file from our call.",
      "Hi — sending the updated version across.",
      "Hey — the report came back, sharing it here.",
      "Hi — I pulled together the paperwork we discussed.",
      "Hi — one more detail on the document.",
    ],
    middles: [
      "I have put the paperwork together and it is ready when you are.",
      "I can send the summary across once the times are settled.",
      "Everything checks out on our side — only the date needs a look.",
      "Page three is the part that needs your initials.",
      "Let me know if the formatting came through alright.",
      "I marked the two sections that changed since last week.",
      "Nothing urgent, I just want to make sure it landed correctly.",
      "Happy to re-send in a different format if that is easier.",
    ],
  },
  {
    subjects: [
      "Quick introduction",
      "Reaching out from {org}",
      "A colleague pointed me your way",
      "Short intro",
      "Hello from our team",
      "Following up on the referral",
      "New point of contact",
    ],
    openers: [
      "Hi — {name} here, quick introduction.",
      "Hello — a mutual contact suggested I reach out.",
      "Hi — I am picking this up from a colleague.",
      "Hello — wanted to introduce myself briefly.",
      "Hi — I will be your point of contact going forward.",
      "Hi — we spoke briefly at the end of last month.",
      "Hey — I am taking over this thread from a teammate.",
    ],
    middles: [
      "I handle the day to day on our side, so anything operational comes to me.",
      "Nothing needed yet — just making sure the line is open.",
      "I will keep things light here and only write when it matters.",
      "If a question is better aimed at someone else, send it my way anyway.",
      "We mostly coordinate by email, so this thread is the right place.",
      "A short note is all I wanted to send for now.",
      "Happy to set up a quick call if that is easier than email.",
    ],
  },
  {
    subjects: [
      "Status update",
      "Where things stand",
      "Progress on the open item",
      "Quick update from our side",
      "This week's status",
      "Notes from our call",
      "Short update on the referral",
    ],
    openers: [
      "Hi — a short update so you know where things stand.",
      "Hi — wanted to close the loop on our call.",
      "Hello — quick progress note from our side.",
      "Hi — the item we discussed is moving again.",
      "Hey — status check on the open item.",
      "Hi — following up on the note from last week.",
      "Hi — a couple of small developments worth flagging.",
    ],
    middles: [
      "Everything is on track for the end of the week.",
      "The last piece is still pending, but the rest is done.",
      "No blockers on our side at the moment.",
      "We are about a day behind the original estimate — nothing serious.",
      "Two of the three items closed out this morning.",
      "I will send a fuller summary once the dust settles.",
      "Let me know if you need more detail than this.",
      "I can send the summary across once the times are settled.",
    ],
  },
  {
    subjects: [
      "Invoice question",
      "The receipt from last month",
      "Billing detail to confirm",
      "Paperwork for next week",
      "Re: the invoice",
      "A small billing correction",
      "Payment confirmation",
    ],
    openers: [
      "Hi — one small thing on the invoice.",
      "Hi — checking a billing detail before it goes out.",
      "Hello — the receipt came through, one question.",
      "Hi — flagging a small correction on our side.",
      "Hi — the payment landed, confirming here.",
      "Hey — a quick note on the paperwork.",
      "Hi — something looks off on the last invoice.",
    ],
    middles: [
      "The total matches, only the reference line needs fixing.",
      "Nothing urgent, I just want the record to line up.",
      "If a corrected copy helps, I can send one over.",
      "It should be a one-line fix on your end.",
      "I will hold the paperwork until this is sorted.",
      "Happy to jump on a quick call if a screenshot is easier.",
      "Once confirmed I will mark it closed on our side.",
    ],
  },
  {
    subjects: [
      "Referral from a colleague",
      "Someone suggested I write",
      "Pointed your way",
      "About the referral",
      "Introduction from a mutual contact",
      "Following up on the referral",
    ],
    openers: [
      "Hi — a colleague passed your name along.",
      "Hello — I was pointed your way this week.",
      "Hi — your name came up in a call yesterday.",
      "Hi — reaching out on a friend's suggestion.",
      "Hey — a mutual contact said you were the person to ask.",
      "Hi — I got your details from a shared client.",
    ],
    middles: [
      "They mentioned you handle this kind of thing regularly.",
      "Nothing urgent — I just wanted to open the conversation.",
      "A short reply either way is plenty.",
      "If it is easier to talk, I am around most afternoons.",
      "I can send background material if that would help.",
      "No agenda beyond a first hello for now.",
    ],
  },
  {
    subjects: [
      "Quick question",
      "One thing to check",
      "Small question on your end",
      "Checking one detail",
      "A favour to ask",
      "Five-minute question",
    ],
    openers: [
      "Hi — one quick question when you get a minute.",
      "Hey — small thing to check on your end.",
      "Hi — hoping you can settle a detail for me.",
      "Hello — one line should cover this.",
      "Hi — a favour, if you have a moment.",
      "Morning — quick question before the week starts.",
    ],
    middles: [
      "Which email should the confirmations go to?",
      "Is the {day} meeting still in the same room?",
      "Do you want the summary in the same format as last time?",
      "Should I loop in the same people as before?",
      "Is there a preferred window for the follow-up?",
      "Does the reference number on the file look right to you?",
      "Who is the best contact for the logistics side?",
    ],
  },
  {
    subjects: [
      "Thank you",
      "Much appreciated",
      "That worked perfectly",
      "Thanks for the quick turn",
      "Appreciate the help",
      "All sorted on our side",
    ],
    openers: [
      "Hi — just a note to say thanks.",
      "Hi — that worked perfectly, appreciate it.",
      "Hello — thank you for the quick turnaround.",
      "Hi — everything landed correctly this morning.",
      "Hey — wanted to say thanks before the weekend.",
      "Hi — all sorted on our side, thanks to you.",
    ],
    middles: [
      "It saved us a real chunk of time this week.",
      "I owe you one — happy to return the favour.",
      "Nothing else needed from me at this point.",
      "The team was glad to have it settled.",
      "It is rare to get an answer that fast.",
      "If anything else comes up I will write again.",
    ],
  },
  {
    subjects: [
      "Handing this over",
      "Passing you to the right person",
      "Looping in a colleague",
      "New thread owner",
      "Hand-off for this item",
      "Bringing in the team",
    ],
    openers: [
      "Hi — handing this thread to a colleague from here.",
      "Hi — looping in the right person on our side.",
      "Hello — this one is better handled by my teammate.",
      "Hi — I am passing this to the person who owns it.",
      "Hi — a hand-off so nothing gets lost between us.",
      "Hey — bringing in the colleague who knows this best.",
    ],
    middles: [
      "They have the full context, so no need to repeat anything.",
      "I will stay copied, so nothing falls through.",
      "They will pick it up from the next reply.",
      "Everything so far is in this thread for their reference.",
      "Expect their reply in the next day or two.",
      "Feel free to reply to all and it lands in the right place.",
    ],
  },
  {
    subjects: [
      "Gentle nudge",
      "Still pending on our side",
      "Bumping this up",
      "Checking in before {day}",
      "A reminder on the open item",
      "Following up",
    ],
    openers: [
      "Hi — a gentle nudge on the open item.",
      "Hi — checking in before {day}.",
      "Hello — bumping this in case it slipped.",
      "Hi — still pending on our side, just flagging it.",
      "Hey — circling back in case the last note got buried.",
      "Hi — one more follow-up on this thread.",
    ],
    middles: [
      "If now is not a good time, a rough timeline works too.",
      "No rush — I just want it off the pending list.",
      "Happy to resend the file if that is the holdup.",
      "If priorities moved, say so and I will stop nudging.",
      "A one-line answer is all I need to close this out.",
      "If it should go to someone else, point me there.",
    ],
  },
  {
    subjects: [
      "Sending something useful",
      "A link you might want",
      "Thought of you for this",
      "Resource from our call",
      "The reference you wanted",
      "Passing along a link",
    ],
    openers: [
      "Hi — passing along the link we discussed.",
      "Hi — this came up in our call and I found it.",
      "Hello — sending the reference you wanted.",
      "Hi — thought this might be useful on your side.",
      "Hey — the resource I mentioned is below.",
      "Hi — sharing something that answers the question from {day}.",
    ],
    middles: [
      "No action needed — just keeping it on the record.",
      "The relevant part is about halfway down the page.",
      "If it is not quite what you meant, tell me and I will dig further.",
      "It saved us some back and forth, so I thought it might help you too.",
      "I can pull more like it if this one is on target.",
      "Worth a skim rather than a deep read, I would say.",
    ],
  },
  {
    subjects: [
      "Following up on the intake form",
      "Availability for the assessment next week",
      "Confirming the report timeline",
      "Next steps from here",
      "Where we left off",
      "Resuming after the break",
    ],
    openers: [
      "Hi — picking the thread back up.",
      "Hi — following up on the intake form.",
      "Hello — confirming the report timeline.",
      "Hi — checking where we left off before the break.",
      "Hi — the assessment availability for next week is out.",
      "Hey — resuming our thread from earlier this month.",
    ],
    middles: [
      "Nothing urgent, I just want to make sure the dates line up.",
      "Let me know which option suits and I will confirm it.",
      "Same process as last time, so it should be quick.",
      "If the timeline still holds, I will lock it in.",
      "The form takes about five minutes once you have the details handy.",
      "I will wait for your go-ahead before booking anything.",
    ],
  },
];

/** Reply pools keyed loosely by intent so a reply reads like an answer. */
const REPLIES = [
  "Thanks — that works on my end. See you then.",
  "Got it, thanks for confirming. Nothing else needed from me.",
  "Sounds good. The afternoon is better for me if that is still open.",
  "Thanks for the update. I will watch for the paperwork.",
  "That all looks right to me. Thanks for checking.",
  "Perfect, thanks. Let me know if anything shifts.",
  "Appreciate it — I will take a look today.",
  "Yes, {day} still works. Thanks for checking in.",
  "Received, thanks. Will get back to you by end of day.",
  "All good here. Thanks for the heads up.",
  "Noted, thanks. I will flag it if anything changes.",
  "Thanks for the file — opened fine on this end.",
  "Okay on my side. Go ahead.",
  "Confirmed — no changes needed.",
  "Thanks, that answers it. Nothing further.",
  "Works for me. I will send confirmation shortly.",
  "Good timing — I was about to ask the same thing.",
  "Thanks for the intro. Looking forward to working together.",
  "Understood. I will coordinate with them directly.",
  "Appreciate the reminder — it did get buried.",
  "Yes, please do. That would help a lot.",
  "No problem at all — the delay was on our end.",
  "Happy to. Give me until {day} and I will have it ready.",
  "Received loud and clear. Thanks for the nudge.",
  "That's settled then. Thanks for closing the loop.",
  "Great, locking it in now.",
  "Thanks — passed it along to the right person here.",
  "Acknowledged. I'll keep an eye out for it.",
  "Same time next week works if you're offering.",
  "Cheers — I owe you a quick reply in kind.",
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
  const vars = { "{day}": weekday, "{name}": fromName, "{org}": orgName ?? fromName };
  const fill = (line) => Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(k, v), line);
  const scenario = pick(rng, SCENARIOS);
  const subject = fill(pick(rng, scenario.subjects));
  const body = `${fill(pick(rng, scenario.openers))}\n\n${fill(pick(rng, scenario.middles))}`;
  const closer = pick(rng, CLOSERS);
  const domain = String(fromAddress).split("@")[1] ?? "";
  const text = `${body}\n\n${closer}\n${signatureText(fromName, domain)}`;

  // A logo variant without a logo would silently send plain HTML and the
  // per-variant report would then compare two things that are the same.
  const useLogo = (variant === "html_logo" || variant === "html_rich") && logo;
  if ((variant === "html_logo" || variant === "html_rich") && !logo) {
    throw new Error(`variant "${variant}" needs a logo; set "logoPath" in the config`);
  }

  if (variant === "promo") {
    return composePromo(rng, { fromName, fromAddress, replyAddress: replyTo, org: orgName ?? fromName });
  }
  if (variant === "newsletter") {
    return composeNewsletter(rng, { fromName, fromAddress, replyAddress: replyTo, org: orgName ?? fromName });
  }
  if (variant === "plain") return { subject, text, html: null, attachments: [], headers: null, variant };

  // A file attached rather than embedded. Inline images ride in the body and
  // are filtered as part of it; a real attachment is scanned separately, so the
  // two shapes are not interchangeable and each needs its own measurement.
  if (variant === "attachment") {
    if (!logo) throw new Error('variant "attachment" needs a logo; set "logoPath" in the config');
    const paras = body.split("\n\n").map((x) => `<p>${escapeHtml(x)}</p>`).join("");
    return {
      subject,
      text: `${text}\n\n(attached: ${logo.filename})`,
      html: `<div>${paras}<p>${escapeHtml(closer)}<br>${escapeHtml(fromName)}</p></div>`,
      attachments: [{ disposition: "attachment", filename: logo.filename, type: logo.type, content: logo.content }],
      headers: null,
      variant,
    };
  }

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

/**
 * The most aggressive shape we send: a giveaway or offer above the fold. It
 * exists to be measured, not recommended. Modelled on a real competitor
 * broadcast, and expected to place worse than every other variant — which is
 * the finding, if it holds.
 *
 * Note before aiming this at anyone real: a promotional contest is regulated
 * separately from email law, with its own disclosure rules, and it is
 * unambiguously a commercial electronic message. Like "newsletter", it carries
 * a List-Unsubscribe header but no physical mailing address; callers sending
 * this variant to real recipients must supply one themselves.
 */
function composePromo(rng, { fromName, fromAddress, replyAddress, org }) {
  const domain = String(fromAddress).split("@")[1] ?? "";
  const reply = replyAddress ?? fromAddress;
  const prize = pick(rng, ["two tickets to the Saturday match", "a pair of tickets to this weekend's game", "two seats at Saturday's home game"]);
  const subject = pick(rng, [
    "Contest: two tickets to Saturday's match",
    "Win two tickets to the weekend game",
    "Quick question, and two tickets on offer",
  ]);
  const rows = availabilityRows(rng);
  const textRows = rows.map((r) => `  ${r.date} — ${r.city} — ${r.kind}`).join("\n");

  const text =
    `${pick(rng, NEWSLETTER_INTROS)}\n\n` +
    `WIN ${prize.toUpperCase()}\n\n` +
    `We are giving away ${prize}. To enter, answer one question: name two of the ` +
    `assessment types listed below. Email your answer to ${reply} by 4 PM today. ` +
    `One winner is drawn at random from the correct entries and told by email.\n\n` +
    `Good luck, and thank you for choosing ${org}.\n\n` +
    `UPCOMING AVAILABILITY\n${textRows}\n\n` +
    `${org}\n${domain}\n\nTo stop receiving these updates, reply with "unsubscribe".`;

  const htmlRows = rows
    .map((r) => `<tr><td style="padding:4px 12px 4px 0">${escapeHtml(r.date)}</td><td style="padding:4px 12px 4px 0">${escapeHtml(r.city)}</td><td style="padding:4px 0">${escapeHtml(r.kind)}</td></tr>`)
    .join("");
  const html =
    `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px;color:#1f2933;line-height:1.5">` +
    `<p>${escapeHtml(pick(rng, NEWSLETTER_INTROS))}</p>` +
    `<p style="font-size:18px;font-weight:700;color:#b02a37">WIN ${escapeHtml(prize.toUpperCase())}</p>` +
    `<p>We are giving away ${escapeHtml(prize)}. To enter, answer one question: name two of the ` +
    `assessment types listed below. Email your answer to ${escapeHtml(reply)} by 4 PM today. ` +
    `One winner is drawn at random from the correct entries and told by email.</p>` +
    `<p>Good luck, and thank you for choosing ${escapeHtml(org)}.</p>` +
    `<h3 style="font-size:14px;margin:16px 0 6px">Upcoming availability</h3>` +
    `<table role="presentation" cellpadding="0" cellspacing="0">${htmlRows}</table>` +
    `<p style="color:#52606d;font-size:12px;border-top:1px solid #dfe3e8;padding-top:10px;margin-top:16px">` +
    `${escapeHtml(org)} &middot; ${escapeHtml(domain)}<br>` +
    `To stop receiving these updates, reply with &quot;unsubscribe&quot;.</p></div>`;

  return {
    subject,
    text,
    html,
    attachments: [],
    headers: { "List-Unsubscribe": `<mailto:${reply}?subject=unsubscribe>` },
    variant: "promo",
  };
}

export function composeReply(rng) {
  return pick(rng, REPLIES).replaceAll("{day}", pick(rng, DAYS));
}

/** Rotate deterministically so every identity exercises every shape over a run. */
export function variantFor(index, enabled = VARIANTS) {
  return enabled[index % enabled.length];
}
