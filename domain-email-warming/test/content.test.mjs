import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { compose, composeReply, escapeHtml, VARIANTS, variantFor } from "../scripts/lib/content.mjs";

/** Deterministic pseudo-rng so every assertion here is reproducible. */
function seeded(seed = 1) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
}

const LOGO = { filename: "logo.png", type: "image/png", content: "aGk=" };
const base = { fromName: "IMECore", fromAddress: "hello@imecore.com", toAddress: "s@gmail.com", day: 1 };

describe("compose", () => {
  it("is deterministic for a fixed rng", () => {
    const a = compose(seeded(7), { ...base, variant: "html_simple" });
    const b = compose(seeded(7), { ...base, variant: "html_simple" });
    assert.deepEqual(a, b);
  });

  it("plain sends no html and no attachments", () => {
    const m = compose(seeded(2), { ...base, variant: "plain" });
    assert.equal(m.html, null);
    assert.deepEqual(m.attachments, []);
    assert.ok(m.text.length > 0);
  });

  it("html_simple has html but attaches nothing", () => {
    const m = compose(seeded(3), { ...base, variant: "html_simple" });
    assert.match(m.html, /<p>/);
    assert.deepEqual(m.attachments, []);
  });

  it("html_logo attaches the logo inline and references it by cid", () => {
    const m = compose(seeded(4), { ...base, variant: "html_logo", logo: LOGO });
    assert.match(m.html, /cid:logo/);
    assert.equal(m.attachments.length, 1);
    assert.equal(m.attachments[0].disposition, "inline");
    assert.equal(m.attachments[0].content_id, "logo");
  });

  it("refuses a logo variant with no logo rather than silently degrading", () => {
    // Quietly falling back to plain html would make the per-variant report
    // compare two identical shapes and report a difference that is not there.
    assert.throws(() => compose(seeded(5), { ...base, variant: "html_logo" }), /needs a logo/);
  });

  it("never emits campaign markers in the 1:1 shapes", () => {
    const banned = /(unsubscribe|click here|limited time|https?:\/\/|<a\s)/i;
    for (const variant of ["plain", "html_simple", "html_logo", "html_rich"]) {
      for (let i = 0; i < 60; i++) {
        const m = compose(seeded(i + 1), { ...base, variant, logo: LOGO });
        assert.ok(!banned.test(m.text), `${variant} text leaked a campaign marker`);
        if (m.html) assert.ok(!banned.test(m.html), `${variant} html leaked a campaign marker`);
      }
    }
  });

  it("escapes html so a name with markup cannot inject tags", () => {
    const m = compose(seeded(6), { ...base, fromName: '<script>x</script>', variant: "html_simple" });
    assert.ok(!m.html.includes("<script>"));
    assert.match(m.html, /&lt;script&gt;/);
  });
});

describe("newsletter variant", () => {
  const news = () => compose(seeded(11), { ...base, variant: "newsletter", replyTo: "referrals@imecore.com", orgName: "IMECore" });

  it("carries a List-Unsubscribe header", () => {
    // A bulk shape without it is filtered harder, and once aimed at real
    // recipients it is a CASL problem too.
    assert.match(news().headers["List-Unsubscribe"], /^<mailto:referrals@imecore\.com\?subject=unsubscribe>$/);
  });

  it("includes an availability list and the numbered referral questions", () => {
    const m = news();
    assert.match(m.text, /AVAILABLE APPOINTMENTS/);
    assert.match(m.text, /1\. What is the reason/);
    assert.match(m.html, /<ol/);
  });

  it("points the reply instruction at the reply address, not the send-only sender", () => {
    const m = compose(seeded(12), {
      ...base,
      fromAddress: "referrals@referrals.imecore.com",
      variant: "newsletter",
      replyTo: "referrals@imecore.com",
      orgName: "IMECore",
    });
    assert.match(m.text, /reply to referrals@imecore\.com/);
  });

  it("offers a way to stop, unlike the 1:1 shapes", () => {
    assert.match(news().text, /unsubscribe/i);
  });
});

describe("variantFor", () => {
  it("cycles through every variant so each shape gets measured", () => {
    const seen = new Set();
    for (let i = 0; i < VARIANTS.length; i++) seen.add(variantFor(i, VARIANTS));
    assert.equal(seen.size, VARIANTS.length);
  });

  it("wraps around past the end of the list", () => {
    assert.equal(variantFor(VARIANTS.length, VARIANTS), VARIANTS[0]);
  });
});

describe("composeReply", () => {
  it("returns a short human reply", () => {
    const r = composeReply(seeded(9));
    assert.ok(r.length > 0 && r.split(/\s+/).length < 30);
  });
});

describe("escapeHtml", () => {
  it("escapes the five significant characters", () => {
    assert.equal(escapeHtml(`<&>"'`), "&lt;&amp;&gt;&quot;&#39;");
  });
});

describe("promo variant", () => {
  const promo = () => compose(seeded(21), { ...base, variant: "promo", replyTo: "hello@imecore.com", orgName: "IMECore" });

  it("carries a List-Unsubscribe header and an opt-out line", () => {
    const m = promo();
    assert.match(m.headers["List-Unsubscribe"], /mailto:hello@imecore\.com/);
    assert.match(m.text, /unsubscribe/i);
  });

  it("leads with the offer, which is what makes it the hardest shape to land", () => {
    assert.match(promo().text, /^.*\n\nWIN /s);
  });

  it("escapes the org name in the html", () => {
    const m = compose(seeded(22), { ...base, variant: "promo", orgName: "<b>x</b>", replyTo: "a@b.c" });
    assert.ok(!m.html.includes("<b>x</b>"));
  });

  it("is deterministic for a fixed rng", () => {
    assert.deepEqual(promo(), promo());
  });
});

describe("attachment variant", () => {
  const att = () => compose(seeded(31), { ...base, variant: "attachment", logo: LOGO });

  it("attaches the file rather than embedding it", () => {
    const m = att();
    assert.equal(m.attachments.length, 1);
    assert.equal(m.attachments[0].disposition, "attachment");
    // An inline image rides in the body and is filtered with it; an attached
    // file is scanned separately, so the two are not interchangeable.
    assert.ok(!m.html.includes("cid:"));
  });

  it("names the attachment in the text part", () => {
    assert.match(att().text, /attached: logo\.png/);
  });

  it("refuses without a file rather than sending an empty attachment variant", () => {
    assert.throws(() => compose(seeded(32), { ...base, variant: "attachment" }), /needs a logo/);
  });

  it("is deterministic for a fixed rng", () => assert.deepEqual(att(), att()));
});
