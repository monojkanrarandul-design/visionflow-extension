function getMeaningfulClasses(el) {
  const classes = el.className && typeof el.className === 'string'
    ? el.className.split(/\s+/)
    : [];

  return classes.filter(cls => {
    if (!cls) return false;
    // drop typical Tailwind utility patterns
    if (cls.includes(':')) return false; // hover:, focus:, md: etc
    if (/^(flex|grid|block|inline|hidden|absolute|relative|fixed|sticky)$/.test(cls)) return false;
    if (/^(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|gap|w|h|min-w|min-h|max-w|max-h|top|bottom|left|right|inset|z)-/.test(cls)) return false;
    if (/^(text|bg|border|rounded|shadow|opacity|font|leading|tracking|justify|items|self|overflow|cursor|select|whitespace|break)-/.test(cls)) return false;
    if (/^-?\d/.test(cls)) return false; // starts with a number
    return true;
  }).join(' ');
}

export async function get_snapshot() {
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
    snapshot.push({
      index: i,
      tag: el.tagName.toLowerCase(),
      text: el.textContent?.trim() || '',
      attrs: {
        id: el.id || undefined,
        class: getMeaningfulClasses(el.className) || undefined,
        href: el.getAttribute('href') || undefined,
        src: el.getAttribute('src') || undefined,
        'aria-label': el.getAttribute('aria-label') || undefined,
        type: el.getAttribute('type') || undefined,
      }
    });
    i++;
  });

  let pageData = {
    title: tab.title,
    url: tab.url,
    body: snapshot
  }

  console.log(JSON.stringify(pageData));
  
  return pageData;
}

