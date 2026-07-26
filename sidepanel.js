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
  //Helper to visually highlight and scroll to an element
  function focusAndHighlight(el,value){
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus();
    if(value !== undefined){
      el.value=value;
    }el.style.transition="all 0.3s ease";
    el.style.border="4px solid #22c55e";
    el.style.boxShadow="0 0 15px rgba(34, 197, 94, 0.7)";

  }

  //1. Fill Name
  if(lowerCmd.includes("name")){
    const input=document.querySelector('input[name*="name" i],input[placeholder*="name" i],input[id*="name" i],input[name="q"],textarea[name="q"],input[name="search"],input[type="search"]');
    if(input){
      const val=command.includes("is ") ? command.split("is ").pop() : "Modi";
      focusAndHighlight(input,val);
    }
  }
  //2. Fill Email
  else if (lowerCmd.includes("email")){
    const input=document.querySelector('input[type="email"],input[placeholder*="email" i]');
    if(input){
      const val=command.includes("is ") ? command.split("is ").pop() : "demo@visionflow.ai";
      focusAndHighlight(input,val);
    }
  }
  //3. Scroll Page
  else if(lowerCmd.includes("scroll down")){
    window.scrollBy({top:500,behaviour:'smooth'});
  }
  else if(lowerCmd.includes("scroll up")){
    window.scrollBy({top:-500,behaviour:'smooth'});
  }
  //4.Submit/Click
  else if(lowerCmd.includes("submit") || lowerCmd.includes("click")){
    const btn=document.querySelector('button[type="submit"],input[type="submit"],button');
    if(btn){
      focusAndHighlight(btn);
      setTimeout(()=>btn.click(),600);
    }

  }
}