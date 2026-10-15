// Pre-flight for a slides deck: renders every slide in both themes and checks the rules.
// Usage: node check-deck.mjs <deck-dir>   (needs `npm i playwright` and `npx playwright install firefox`)
// Writes <deck-dir>/shots/{dark,light}/sN.png. Exits 1 when any check fails.
import { firefox } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs'; import { resolve, join } from 'node:path'; import { pathToFileURL } from 'node:url';

const dir = resolve(process.argv[2] || '.');
const sources = readFileSync(join(dir, 'SOURCES.md'), 'utf8');
const url = pathToFileURL(join(dir, 'index.html')).href;
const fails = [], fail = (theme, n, msg) => fails.push(`${theme} s${n}: ${msg}`);

const browser = await firefox.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
for (const theme of ['dark', 'light']) {
  mkdirSync(join(dir, 'shots', theme), { recursive: true });
  await page.goto(`${url}?theme=${theme}#1`, { waitUntil: 'load' });
  const count = await page.locator('.slide').count();
  let prevLayout = null;
  for (let n = 1; n <= count; n++) {
    await page.evaluate(k => { location.hash = '#' + k; }, n);
    await page.waitForTimeout(150);
    const r = await page.evaluate(() => {
      const slide = document.querySelector('.slide.on');
      const lin = v => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      const lum = c => { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      const bgOf = el => { // nearest solid background; text over images is not checked
        for (; el; el = el.parentElement) { const c = getComputedStyle(el).backgroundColor; if (!/rgba\(.*,\s*0\)$|transparent/.test(c)) return c; }
        return 'rgb(255,255,255)';
      };
      const texts = [];
      const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode, el = node.parentElement;
        if (!node.textContent.trim() || !el.getClientRects().length) continue;
        const cs = getComputedStyle(el);
        const a = lum(cs.color), b = lum(bgOf(el));
        texts.push({ text: node.textContent.trim(), px: parseFloat(cs.fontSize),
          head: !!el.closest('h1'), contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) });
      }
      const words = s => s.split(/\s+/).filter(Boolean).length;
      const r = slide.getBoundingClientRect();
      return {
        layout: slide.dataset.layout || '',
        headWords: words(texts.filter(t => t.head).map(t => t.text).join(' ')),
        otherWords: words(texts.filter(t => !t.head).map(t => t.text).join(' ')),
        texts,
        chrome: slide.querySelectorAll('header, footer, nav, .page-number, .counter, .logo-strip').length,
        overflow: [...slide.querySelectorAll('*')].map(e => e.getBoundingClientRect())
          .some(b => b.width && (b.right > r.right + 1 || b.bottom > r.bottom + 1 || b.left < r.left - 1 || b.top < r.top - 1)),
        srcs: [...slide.querySelectorAll('[data-src]')].map(e => ({ id: e.dataset.src, quote: e.matches('.quote') })),
      };
    });
    await page.screenshot({ path: join(dir, 'shots', theme, `s${n}.png`) });
    if (!r.layout) fail(theme, n, 'no data-layout');
    if (r.layout && r.layout === prevLayout) fail(theme, n, `same layout as previous (${r.layout})`);
    prevLayout = r.layout;
    if (r.headWords > 12) fail(theme, n, `headline has ${r.headWords} words (max 12)`);
    if (r.otherWords > 20) fail(theme, n, `other text has ${r.otherWords} words (max 20)`);
    if (r.chrome) fail(theme, n, 'header, footer, nav, page counter or logo strip found');
    if (r.overflow) fail(theme, n, 'an element overflows the 1920x1080 stage');
    for (const t of r.texts) {
      if (t.head && t.px < 96) fail(theme, n, `headline ${t.px}px < 96px: "${t.text.slice(0, 30)}"`);
      else if (t.px < 32) fail(theme, n, `text ${t.px}px < 32px: "${t.text.slice(0, 30)}"`);
      if (t.contrast < (t.head ? 3 : 4.5)) fail(theme, n, `contrast ${t.contrast.toFixed(2)}:1: "${t.text.slice(0, 30)}"`);
    }
    const body = r.texts.filter(t => !t.head);
    if (body.length && Math.max(...body.map(t => t.px)) < 44) fail(theme, n, 'body text is under 44px');
    for (const s of r.srcs) {
      const line = sources.split('\n').find(l => new RegExp(`\\b${s.id}\\b`).test(l));
      if (!line) fail(theme, n, `${s.id} is not in SOURCES.md`);
      else if (s.quote && !/\bVERIFIED\b/.test(line)) fail(theme, n, `quote ${s.id} is not marked VERIFIED`);
    }
  }
  console.log(`${theme}: ${count} slides rendered to shots/${theme}/`);
}
await browser.close();
console.log(fails.length ? fails.join('\n') : 'pre-flight: all checks passed');
process.exit(fails.length ? 1 : 0);
