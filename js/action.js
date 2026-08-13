// Available Actions List
const actions = {
  "navigation": navigation,
  "tab": tab,
  "scroll": scroll,
  "click": click,
  "input": input,
  "keyboard": keyboard,
  "select": select,
  "checkbox": checkbox,
  "hover": hover
};

export default async function execute(action) {
  const fn = actions[action.type];

  if (!fn) {
    throw new Error(`Unknown action: ${action.type}`);
  }

  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return await fn(action, activeTab);
}

// --- Snapshot-independent (unchanged) ---

async function navigation(action, tab) {
  switch (action.action) {
    case "navigate":
      if (!action.data) throw new Error("navigate requires a URL in data");
      return chrome.tabs.update(tab.id, { url: normalizeUrl(action.data) });
    case "go_back":
      return chrome.tabs.goBack(tab.id);
    case "go_forward":
      return chrome.tabs.goForward(tab.id);
    default:
      throw new Error(`Unknown navigation action: ${action.action}`);
  }
}

async function tab(action, currentTab) {
  switch (action.action) {
    case "new_tab":
      return chrome.tabs.create({ url: action.data ? normalizeUrl(action.data) : undefined });
    case "close_tab":
      return chrome.tabs.remove(currentTab.id);
    case "reload":
      return chrome.tabs.reload(currentTab.id);
    default:
      throw new Error(`Unknown tab action: ${action.action}`);
  }
}

async function scroll(action, tab) {
  if (action.action === "scroll_to") {
    if (!action.selector) throw new Error("scroll_to requires a selector");
    return runInPage(tab, (selector) => {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`Element not found: ${selector}`);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [action.selector]);
  }

  const DEFAULT_PIXELS = 500;
  const pixels = Number(action.data) > 0 ? Number(action.data) : DEFAULT_PIXELS;
  const delta = action.action === "scroll_up" ? -pixels
              : action.action === "scroll_down" ? pixels
              : null;

  if (delta === null) throw new Error(`Unknown scroll action: ${action.action}`);

  return runInPage(tab, (amount) => {
    window.scrollBy({ top: amount, left: 0, behavior: "instant" });
  }, [delta]);
}

// --- Snapshot-dependent ---

async function click(action, tab) {
  if (!action.selector) throw new Error("click requires a selector");

  return runInPage(tab, (selector) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`Element not found: ${selector}`);
    el.scrollIntoView({ behavior: "instant", block: "center" });
    el.click();
  }, [action.selector]);
}

async function input(action, tab) {
  if (!action.selector) throw new Error("fill_data requires a selector");

  return runInPage(tab, (selector, value) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`Element not found: ${selector}`);

    el.focus();

    const proto = el.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;

    if (nativeSetter) {
      nativeSetter.call(el, value);
    } else {
      el.value = value; // fallback for non-standard/custom elements
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, [action.selector, action.data ?? ""]);
}

async function keyboard(action, tab) {
  const key = action.data;
  if (!key) throw new Error("press requires a key in data");

  return runInPage(tab, (selector, key) => {
    const target = (!selector || selector === "window")
      ? document.activeElement || document.body
      : document.querySelector(selector);

    if (!target) throw new Error(`Element not found: ${selector}`);

    const opts = { key, bubbles: true, cancelable: true };
    target.dispatchEvent(new KeyboardEvent("keydown", opts));
    target.dispatchEvent(new KeyboardEvent("keypress", opts));
    target.dispatchEvent(new KeyboardEvent("keyup", opts));

    // Synthetic Enter rarely triggers native form submission — fall back
    // to submitting the enclosing form directly when applicable.
    if (key === "Enter") {
      const form = target.closest?.("form");
      if (form) form.requestSubmit();
    }
  }, [action.selector, key]);
}

async function select(action, tab) {
  if (!action.selector) throw new Error("select_dropdown requires a selector");

  return runInPage(tab, (selector, value) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`Element not found: ${selector}`);

    let option = [...el.options].find(o => o.value === value);
    if (!option) option = [...el.options].find(o => o.textContent.trim() === value);
    if (!option) throw new Error(`No matching option for: ${value}`);

    el.value = option.value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, [action.selector, action.data ?? ""]);
}

async function checkbox(action, tab) {
  if (!action.selector) throw new Error("toggle_checkbox requires a selector");

  return runInPage(tab, (selector, data) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`Element not found: ${selector}`);

    const desired = data === "true" ? true
                  : data === "false" ? false
                  : !el.checked; // no data -> toggle

    if (el.checked !== desired) {
      el.click(); // fires native change/input listeners correctly
    }
  }, [action.selector, action.data ?? ""]);
}

async function hover(action, tab) {
  if (!action.selector) throw new Error("hover requires a selector");

  return runInPage(tab, (selector) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`Element not found: ${selector}`);
    el.scrollIntoView({ behavior: "instant", block: "center" });
    el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  }, [action.selector]);
}

// --- Helpers ---

function normalizeUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

async function runInPage(tab, func, args = []) {
  const [{ result } = {}] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func,
    args
  });
  return result;
}