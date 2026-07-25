const statusDiv = document.getElementById('status');
const startBtn = document.getElementById('start-btn');

// Initialize Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';

function speak(text) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

startBtn.addEventListener('click', () => {
  recognition.start();
  statusDiv.innerText = "Listening...";
});

recognition.onresult = async (event) => {
  const command = event.results[0][0].transcript;
  statusDiv.innerText = `You said: "${command}"`;

  // 1. Get current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  speak(`Processing command: ${command}`);

  // 2. Execute user action on the webpage using Chrome Scripting API
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: executeUserAction,
    args: [command]
  });
};

// Injected function executed directly on the active webpage
function executeUserAction(command) {
  const lowerCmd = command.toLowerCase();

  if (lowerCmd.includes("fill name") || lowerCmd.includes("my name is")) {
    const nameInput = document.querySelector('input[name*="name"], input[placeholder*="Name"], input[id*="name"]');
    if (nameInput) {
      const nameVal = command.includes("is ") ? command.split("is ").pop() : "Alex Vance";
      nameInput.value = nameVal;
      nameInput.style.border = "3px solid #22c55e";
    }
  } else if (lowerCmd.includes("submit") || lowerCmd.includes("click button")) {
    const btn = document.querySelector('button[type="submit"], input[type="submit"], button');
    if (btn) {
      btn.click();
      btn.style.border = "3px solid #22c55e";
    }
  }
}