
export default function speak(text) {
  if (!text || typeof text !== "string") {
    return;
  }

  if (!("speechSynthesis" in window)) {
    console.error("Text-to-Speech is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.onstart = () => {
    console.log("TTS started");
  };

  utterance.onend = () => {
    console.log("TTS finished");
  };

  utterance.onerror = (event) => {
    console.error("TTS error:", event.error);
  };

  window.speechSynthesis.speak(utterance);
}
