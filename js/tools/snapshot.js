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

function normalizeHref(href, baseUrl) {
  try {
    const u = new URL(href, baseUrl);
    return u.pathname + u.search;
  } catch {
    return href;
  }
}

const GENERIC_IDS = new Set(['endpoint', 'button', 'thumbnail', 'content', 'container', 'video-title-link']);

export default async function get_snapshot() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.documentElement.outerHTML
  });

  const doc = new DOMParser().parseFromString(results[0].result, "text/html");
  const TAGS = ['input', 'button', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'a'];
  const elements = doc.querySelectorAll(TAGS.join(','));
  const snapshot = [];
  let i = 0;

  elements.forEach(el => {
    let rawText = el.textContent?.trim() || '';
    let text = cleanText(rawText).slice(0, 20);

    let id = (el.id && !GENERIC_IDS.has(el.id)) ? el.id : undefined;
    let tag = el.tagName.toLowerCase();
    if(tag == 'p' || tag == 'h2' || tag == 'h3' || tag == 'h4' || tag == 'h5' || tag == 'h6' || tag == 'h1' || tag == 'li'){
      id = undefined;
    }
    let classes = getMeaningfulClasses(el.className) || undefined;
    let href = el.getAttribute('href') || undefined;
    let hrefSliced = undefined;
    if(href != undefined){
      hrefSliced = href.includes("https://")? href.slice(0,150) : href.slice(0,70);
    }
    let src = el.getAttribute('src') || undefined;
    let type = el.getAttribute('type') || undefined;

    const hasUsefulAttr = id !== undefined || classes !== undefined || href !== undefined || src !== undefined || type !== undefined;

    if (text !== "" && hasUsefulAttr) {
      snapshot.push({
        index: i,
        tag: tag,
        text: text,
        attrs: { id, class: classes, href: hrefSliced, src, type }
      });
    }
    i++;
  });

  // dedupe by normalized href — keep the entry with the more descriptive text
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