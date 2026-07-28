const statusDiv = document.getElementById('status');
const startBtn = document.getElementById('start-btn');
const commandInput = document.getElementById('command-input');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';

// 1. Get the real browser tab (filters out extension sidepanels completely)
async function getTargetTab() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  // Find the active tab that is NOT an internal chrome page
  let activeTab = tabs.find(t => t.active && t.url && !t.url.startsWith("chrome"));
  
  if (!activeTab) {
    // Fallback: search all tabs for any HTTP/HTTPS tab
    const allTabs = await chrome.tabs.query({});
    activeTab = allTabs.find(t => t.active && t.url && (t.url.startsWith("http://") || t.url.startsWith("https://")));
  }
  return activeTab;
}

// 2. Process Command
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

// 3. Executed inside Webpage DOM
function executeUserAction(command) {
  console.log("VisionFlow AI executing command:", command);
  const lowerCmd = command.toLowerCase();

  // Highlight and focus helper
  function applyGlow(el, value) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus();
    if (value !== undefined) {
      el.value = value;
      // Trigger native input events so framework sites update UI
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    el.style.transition = "all 0.3s ease";
    el.style.border = "4px solid #22c55e";
    el.style.boxShadow = "0 0 20px rgba(34, 197, 94, 0.9)";
  }

  // --- A. SCROLL LOGIC ---
  if (lowerCmd.includes("scroll down")) {
    window.scrollBy({ top: 500, behavior: 'smooth' });
    return; // Stop execution here
  } 
  else if (lowerCmd.includes("scroll up")) {
    window.scrollBy({ top: -500, behavior: 'smooth' });
    return; // Stop execution here
  }

  // --- B. SUBMIT / CLICK LOGIC ---
  if (lowerCmd.includes("submit") || lowerCmd.includes("click") || lowerCmd.includes("enter")) {
    // 1. Try to find a submit button
    const btn = document.querySelector('button[type="submit"], input[type="submit"], button.searchButton, button');
    if (btn) {
      applyGlow(btn);
      setTimeout(() => btn.click(), 500);
    }
    
    // 2. Also try pressing 'Enter' on whatever is currently focused (great for search bars)
    if (document.activeElement) {
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
        document.activeElement.dispatchEvent(enterEvent);
    }
    return; // Stop execution here
  }

  // --- C. SMART SEARCH & FILL LOGIC ---
  let queryText = command;
  if (lowerCmd.includes("search ")) {
    queryText = command.substring(lowerCmd.indexOf("search ") + 7);
  } else if (lowerCmd.includes("is ")) {
    queryText = command.split(/is /i).pop();
  }
  //--- D. VIDEO CONTROL LOGIC ---
  const video=document.querySelector('video');

  if(video){
    //1.Play/Pause/Click Video
    if(lowerCmd.includes("play video")||lowerCmd.includes("pause")||lowerCmd.includes("click video")){
      video.paused ? video.play() : video.pause();
      applyGlow(video);
      return;
    }
    //2. Absolute timeskip (e.g., "go to 2 minutes 30 seconds", "skip to 10 min")
    // Catches "go to", "skip to", "time skip to"
    if(lowerCmd.match(/(go to|skip to|time skip)/)){
      let totalSeconds=0;

      //Extract minutes and seconds using Regex
      const minMatch=lowerCmd.match(/(\d+)\s*(m|min|minute)/);
      const secMatch=lowerCmd.match(/(\d+)\s*(s|sec|second)/);

      if(minMatch) totalSeconds+=parseInt(minMatch[1],10) * 60;
      if(secMatch) totalSeconds+=parseInt(secMatch[1],10);

      // Only execute if we  successfully parsed a time (or they explicitly asked for 0)
      if(totalSeconds>0||lowerCmd.includes("0")){
        video.currentTime=totalSeconds;
        applyGlow(video);
        return;
      }
    }
    // 4. Volume Controls
    if(lowerCmd.includes("mute")||lowerCmd.includes("volume")){
      //Mute/Unmute
      if(lowerCmd.includes("unmute")){
        video.muted=false;
      }else if(lowerCmd.includes("mute")){
        video.muted=true;
      }

      //Volume Up/Down
      if(lowerCmd.includes("volume up")||lowerCmd.includes("increase volume")){
        video.muted=false;
        video.volume=Math.min(1.0, video.volume +0.1);
      }else if(lowerCmd.includes("volume down")||lowerCmd.includes("decrease volume")){
        video.volume=Math.max(0.0, video.volume -0.1);
      }

      //Absolute Volume(eg: "set volume to 50", "volume 100")
      const volMatch=lowerCmd.match(/volume.*?(\d+)/);
      if(volMatch){
        let targetVol=parseInt(volMatch[1], 10);
        video.muted=false;
        video.volume=Math.max(0.0, Math.min(1.0, targetVol / 100));
      }
      applyGlow(video);
      return;
    }
     //3. Relative Timeskip (e.g., skip forward 10 seconds", "go back 15 sec", "10s+")
     if(lowerCmd.includes("forward") || lowerCmd.includes("back") || lowerCmd.includes("rewind")||lowerCmd.includes("skip")){
      //Find the number of secons, default to 10 if they just say "skip forward"
      const numMatch=lowerCmd.match(/(\d+)/);
      const skipAmount=numMatch ? parseInt(numMatch[1], 10) : 10;

      //Determine Direction
      if(lowerCmd.includes("back")||lowerCmd.includes("rewind")||lowerCmd.includes("-")){
        video.currentTime-=skipAmount;  
      }else{
        video.currentTime+=skipAmount;
      }
      applyGlow(video);
      return;
     }
  }

  // Find ANY visible input element on the page
  const allInputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea:not([type="hidden"])'));
  
  let targetInput = allInputs.find(i => {
    const attr = (i.name + i.id + i.placeholder + i.type + i.className).toLowerCase();
    return attr.includes("search") || attr.includes("q") || attr.includes("name");
  });

  if (!targetInput) {
    targetInput = allInputs.find(i => i.offsetWidth > 0);
  }

  if (targetInput) {
    applyGlow(targetInput, queryText);
  } else {
    console.warn("VisionFlow AI: No input element found on this page.");
  }
}
//Adding this error handler to catch permission blocks
recognition.onerror=(event) => {
  if(event.error==='not-allowed'){
    statusDiv.innerText="Mic blocked! Opening setup tab...";
    chrome.tabs.create({ url: chrome.runtime.getURL('setup.html')});
  }
  else{
    statusDiv.innerText=`Error: ${event.error}. Try again.`;
  }
};