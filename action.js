export function executeUserAction(command) {
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
    return;
  } else if (lowerCmd.includes("scroll up")) {
    window.scrollBy({ top: -500, behavior: 'smooth' });
    return;
  }

  // --- B. SUBMIT / CLICK LOGIC ---
  if (lowerCmd.includes("submit") || lowerCmd==="click" || lowerCmd.includes("enter")) {
    const btn = document.querySelector('button[type="submit"], input[type="submit"], button.searchButton, button');
    if (btn) {
      applyGlow(btn);
      setTimeout(() => btn.click(), 500);
    }
    
    if (document.activeElement) {
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
        document.activeElement.dispatchEvent(enterEvent);
    }
    return; 
  }

  // --- C. VIDEO CONTROL LOGIC ---
  const video = Array.from(document.querySelectorAll('video')).find(v=>v.offsetWidth > 0);
  
  if (video) {
    // 1. Play / Pause
    if (lowerCmd.includes("play video") || lowerCmd.includes("pause") || lowerCmd.includes("click video")) {
      video.paused ? video.play() : video.pause();
      applyGlow(video);
      return; 
    }

    // 2. Absolute Timeskip (e.g., "go to 2 minutes 30 seconds")
    if (lowerCmd.match(/(go to|skip to|time skip)/)) {
      let totalSeconds = 0;
      const minMatch = lowerCmd.match(/(\d+)\s*(m|min|minute)/);
      const secMatch = lowerCmd.match(/(\d+)\s*(s|sec|second)/);
      
      if (minMatch) totalSeconds += parseInt(minMatch[1], 10) * 60;
      if (secMatch) totalSeconds += parseInt(secMatch[1], 10);
      
      if (totalSeconds > 0 || lowerCmd.includes("0")) {
        video.currentTime = totalSeconds;
        applyGlow(video);
        return;
      }
    }

    // 3. Relative Timeskip (e.g., "skip forward 10 seconds")
    if (lowerCmd.includes("forward") || lowerCmd.includes("back") || lowerCmd.includes("rewind") || lowerCmd.includes("skip")) {
      const numMatch = lowerCmd.match(/(\d+)/);
      const skipAmount = numMatch ? parseInt(numMatch[1], 10) : 10; 
      
      if (lowerCmd.includes("back") || lowerCmd.includes("rewind") || lowerCmd.includes("-")) {
        video.currentTime -= skipAmount;
      } else {
        video.currentTime += skipAmount;
      }
      applyGlow(video);
      return;
    }

    // 4. Volume Controls
    if (lowerCmd.includes("mute") || lowerCmd.includes("volume")) {
      if (lowerCmd.includes("unmute")) {
        video.muted = false;
      } else if (lowerCmd === "mute" || lowerCmd.includes("mute video")) {
        video.muted = true;
      }
      
      if (lowerCmd.includes("volume up") || lowerCmd.includes("increase volume")) {
        video.muted = false;
        video.volume = Math.min(1.0, video.volume + 0.2);
      } else if (lowerCmd.includes("volume down") || lowerCmd.includes("decrease volume")) {
        video.volume = Math.max(0.0, video.volume - 0.2);
      }
      
      const volMatch = lowerCmd.match(/volume.*?(\d+)/);
      if (volMatch) {
        let targetVol = parseInt(volMatch[1], 10);
        video.muted = false;
        video.volume = Math.max(0.0, Math.min(1.0, targetVol / 100));
      }
      applyGlow(video);
      return;
    }
  } 
  // 5. Thumbnail Fallback (For YouTube Search Result Pages)
  else if (!video && (lowerCmd.includes("play") || lowerCmd.includes("click video"))) {
    const thumbnail=document.querySelector('a#thumbnail[href*="/watch"]');
    if(thumbnail){
      applyGlow(thumbnail);
      setTimeout(() => thumbnail.click(), 500);
      return;
    }
  }

  // --- D. SMART SEARCH & FILL LOGIC ---
  let queryText = command;
  if (lowerCmd.includes("search ")) {
    queryText = command.substring(lowerCmd.indexOf("search ") + 7);
  } else if (lowerCmd.includes("is ")) {
    queryText = command.split(/is /i).pop();
  }

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