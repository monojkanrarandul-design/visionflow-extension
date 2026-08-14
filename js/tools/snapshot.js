function getMeaningfulClasses(el) {
  const classes = el.className && typeof el.className === 'string'
    ? el.className.split(/\s+/)
    : [];

  return classes.filter(cls => {
    if (!cls) return false;
    if (cls.includes(':')) return false;
    if (/^(flex|grid|block|inline|hidden|absolute|relative|fixed|sticky)$/.test(cls)) return false;
    if (/^(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|gap|w|h|min-w|min-h|max-w|max-h|top|bottom|left|right|inset|z)-/.test(cls)) return false;
    if (/^(text|bg|border|rounded|shadow|opacity|font|leading|tracking|justify|items|self|overflow|cursor|select|whitespace|break)-/.test(cls)) return false;
    if (/^-?\d/.test(cls)) return false;
    return true;
  }).join(' ');
}

function cleanText(text) {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  const words = collapsed.split(' ');
  const seen = new Set();
  return words.filter(w => {
    const key = w.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join(' ');
}

function unwrapRedirect(href) {
  const redirectMatch = href.match(/\/x\/c\/[^/]+\/(https?:\/\/.+)$/);
  if (redirectMatch) {
    try {
      return decodeURIComponent(redirectMatch[1]);
    } catch {
      return redirectMatch[1];
    }
  }
  const clkMatch = href.match(/[?&]r=([^&]+)/);
  if (clkMatch) {
    try {
      return decodeURIComponent(clkMatch[1]);
    } catch {
      return href;
    }
  }
  return href;
}

function normalizeHref(href, baseUrl) {
  try {
    const actualHref = unwrapRedirect(href);
    const u = new URL(actualHref, baseUrl);
    return u.pathname + u.search;
  } catch {
    return href;
  }
}

const GENERIC_IDS = new Set(['endpoint', 'button', 'thumbnail', 'content', 'container', 'video-title-link']);

// Ad/sponsored and chrome containers to skip wholesale — these are
// responsible for most of the volume on pages like Amazon search results
// and rarely matter for task automation.
const SKIP_CONTAINER_SELECTOR = [
  '.AdHolder',
  '.s-featured-result-item',
  '.a-carousel-card',
  '[data-component-type="sp-sponsored-result"]',
  '#s-refinements',
  '#navFooter',
  '.rufus-panel-container',
  '.rhf-frame',
  '.ape-placement'
].join(', ');

// Price is split across symbol/whole/decimal/fraction spans by Amazon;
// skip these fragment spans to avoid 4 rows per price.
const PRICE_FRAGMENT_RE = /\ba-price-(symbol|whole|decimal|fraction)\b/;

export default async function get_snapshot() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.documentElement.outerHTML
  });

  const doc = new DOMParser().parseFromString(results[0].result, "text/html");
  const TAGS = ['input', 'button', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'a', 'textarea', 'span'];
  const elements = doc.querySelectorAll(TAGS.join(','));
  const snapshot = [];
  let i = 0;

  elements.forEach(el => {
    const tag = el.tagName.toLowerCase();

    // Skip hidden inputs outright — never user-actionable, but they'd
    // otherwise pass hasUsefulAttr purely because `type` is set.
    if (tag === 'input' && el.getAttribute('type') === 'hidden') {
      i++;
      return;
    }

    // Skip elements inside recognized ad/sponsored/chrome containers.
    if (el.closest?.(SKIP_CONTAINER_SELECTOR)) {
      i++;
      return;
    }

    // Skip individual price-fragment spans; the parent price container
    // (e.g. `.a-price` with an `.a-offscreen` full-text child) already
    // carries the human-readable price as text.
    if (PRICE_FRAGMENT_RE.test(el.className || '')) {
      i++;
      return;
    }

    let rawText = el.textContent?.trim() || '';
    let text = cleanText(rawText).slice(0, 20);

    let id = (el.id && !GENERIC_IDS.has(el.id)) ? el.id : undefined;
    if (tag == 'p' || tag == 'h2' || tag == 'h3' || tag == 'h4' || tag == 'h5' || tag == 'h6' || tag == 'h1' || tag == 'li') {
      id = undefined;
    }
    let classes = (el.className) || undefined;
    let href = el.getAttribute('href') || undefined;
    let hrefSliced = undefined;
    if (href != undefined) {
      hrefSliced = href.includes("https://") ? href.slice(0, 150) : href.slice(0, 70);
    }
    let src = el.getAttribute('src') || undefined;
    let type = el.getAttribute('type') || undefined;

    const hasUsefulAttr = id !== undefined || classes !== undefined || href !== undefined || src !== undefined || type !== undefined;

    if (hasUsefulAttr && type != "hidden") {
      snapshot.push({
        index: i,
        tag: tag,
        text: text,
        attrs: { id, class: classes, href, src, type }
      });
    }
    i++;
  });

  // dedupe by normalized href (unwrapping ad redirects first) — keep the
  // entry with the more descriptive text
  const seen = new Map();
  const deduped = [];

  for (const item of snapshot) {
    const rawHref = item.attrs?.href;
    const key = rawHref ? normalizeHref(rawHref, tab.url) : undefined;

    if (key && seen.has(key)) {
      const existingIdx = seen.get(key);
      if (item.text.length > deduped[existingIdx].text.length) {
        deduped[existingIdx] = item;
      }
      continue;
    }
    if (key) seen.set(key, deduped.length);
    deduped.push(item);
  }

  let pageData = {
    title: tab.title,
    url: tab.url,
    body: deduped
  };

  console.log(JSON.stringify(pageData));

  return pageData;
}