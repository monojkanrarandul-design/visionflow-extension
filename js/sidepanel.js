import { executeUserAction } from './action.js';

const statusDiv = document.querySelector('.tip');
const startBtn = document.getElementById('startListening');
const commandInput = document.getElementById('command-input');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';

// Get the real browser tab (filters out extension sidepanels)
async function getTargetTab() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  let activeTab = tabs.find(t => t.active && t.url && !t.url.startsWith("chrome"));
  
  if (!activeTab) {
    const allTabs = await chrome.tabs.query({});
    activeTab = allTabs.find(t => t.active && t.url && (t.url.startsWith("http://") || t.url.startsWith("https://")));
  }
  return activeTab;
}

// Process Command
async function processCommand(command) {
  statusDiv.innerText = `Executing: "${command}"`;

  const tab = await getTargetTab();

  if (!tab) {
    statusDiv.innerText = "Error: Please click on the webpage on the left!";
    return;
  }

  // Inject script directly into target tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: executeUserAction,
    args: [command]
  });
}

// Event Listeners
startBtn.addEventListener('click', () => {
  try {
    recognition.start();
    statusDiv.innerText = "Listening...";
  } catch (e) {
    statusDiv.innerText = "Listening again...";
  }
});

recognition.onresult = (event) => {
  const command = event.results[0][0].transcript;
  processCommand(command);
};

if (commandInput) {
  commandInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      processCommand(commandInput.value);
      commandInput.value = '';
    }
  });
}

recognition.onerror = (event) => {
  if (event.error === 'not-allowed') {
    statusDiv.innerText = "Mic blocked! Opening setup tab...";
    chrome.tabs.create({ url: chrome.runtime.getURL('setup.html') });
  } else {
    statusDiv.innerText = `Error: ${event.error}. Try again.`;
  }
};