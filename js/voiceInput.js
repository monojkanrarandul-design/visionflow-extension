import callAPI from "./api.js";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Speech Recognition is not supported in this browser.");
  throw new Error("Speech Recognition not supported.");
}

const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";
recognition.maxAlternatives = 1;

let isListening = false;
let isSending = false;

let finalTranscript = "";
let silenceTimer = null;
let lastSentTranscript = "";

// 3-second silence delay before firing the API
const SILENCE_DELAY = 3000; 

export function startListening() {
  if (isListening) return;
  recognition.start();
}

export function stopListening() {
  isListening = false; // Ensure state is updated so onend doesn't auto-restart
  recognition.stop();
}

recognition.onstart = () => {
  isListening = true;
  const statusEl = document.querySelector(".status");
  if (statusEl) statusEl.innerHTML = "Listening...";
}

recognition.onend = () => {
  const statusEl = document.querySelector(".status");
  if (statusEl) statusEl.innerHTML = "Not Listening...";
  
  // Auto-restart listening if it was unintentionally disconnected
  setTimeout(() => {
    // Fixed typo from the original code (lisListening -> isListening)
    if (isListening) { 
      recognition.start();
    }
  }, 5000);
}

recognition.onerror = (event) => {
  console.log("Speech Error:", event.error);
  if (event.error === "no-speech") return;
}

recognition.onresult = (event) => {
  let interimTranscript = "";
  
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      finalTranscript += transcript + " ";
    } else {
      interimTranscript += transcript;
    }
  }

  // Update UI with what the user is currently saying
  const statusEl = document.querySelector(".status");
  if (statusEl) {
    statusEl.innerHTML = interimTranscript || finalTranscript;
  }

  // Reset the silence timer every time a new word is detected
  clearTimeout(silenceTimer);

  // If 3 seconds pass without speech, send to backend
  silenceTimer = setTimeout(async () => {
    const message = finalTranscript.trim();
    
    // Prevent empty or duplicate sends
    if (message === "" || message === lastSentTranscript || isSending) {
      return;
    }

    isSending = true;
    lastSentTranscript = message;
    
    if (statusEl) {
      statusEl.innerHTML = `<strong>Sending: </strong> ${message}`;
    }

    try {
      // Backend call - callAPI pauses listening and processes the action
      isListening = await callAPI(message); 
    } catch (err) {
      console.error("API Call Error:", err);
    } finally {
      // Reset variables for the next command
      finalTranscript = "";
      isSending = false;
    }

  }, SILENCE_DELAY);
}

export default { startListening, stopListening };