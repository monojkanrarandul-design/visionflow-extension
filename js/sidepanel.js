import { startListening, stopListening } from "./voiceInput.js";

const statusDiv = document.querySelector('.tip');
const startBtn = document.getElementById('startListening');
// const commandInput = document.getElementById('command-input');
const container = document.querySelector(".container");
let html = `
  <div class="hero hero--compact">
  <img src="image/logo.svg" alt="VisionFlow Logo" class="logo logo--small" />
  <h1>VisionFlow</h1>
</div>

<div class="status"></div>
<div class="markdown"></div>

<button id="stopListening" class="listen-btn listen-btn--active">
  <span class="listen-indicator">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="8" width="2.5" height="8" rx="1.25" />
      <rect x="9" y="5" width="2.5" height="14" rx="1.25" />
      <rect x="14" y="7" width="2.5" height="10" rx="1.25" />
      <rect x="19" y="9" width="2.5" height="6" rx="1.25" />
    </svg>
  </span>
  <span>Listening</span>
</button>
`;

let listening = false;

navigator.permissions.query({ name: "microphone" })
  .then((permissionStatus) => {
    console.log("Microphone permission:", permissionStatus.state);
    if(permissionStatus.state != "granted"){
      window.open("setup.html", "_blank");
    }
  });

startBtn.onclick = () => {
    container.innerHTML = html;
    listening = true;
    startListening();
}
