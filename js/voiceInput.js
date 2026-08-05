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

const SILENCE_DELAY = 4000;

function startListening() {
    if (isListening) return;
    recognition.start();
}

function stopListening() {
    recognition.stop()
}

recognition.onstart = () => {
    isListening = true;
    console.log("listening")
}

recognition.onend = () => {
    isListening = false;
    console.log("listening");

    setTimeout(() => {
        if (!isListening) {
            recognition.start();
        }
    }, 300);
}

recognition.onerror = (event) => {
    console.log("Speech Error:", event.error);

    // Ignore "no-speech" errors.
    if (event.error === "no-speech") return;
};

recognition.onstart = (event) => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
        } else {
            interimTranscript += transcript;
        }
    }

    console.clear();
    console.log("Final:", finalTranscript);
    console.log("Interim:", interimTranscript);

    // Reset silence timer
    clearTimeout(silenceTimer);

    silenceTimer = setTimeout(async () => {

        const message = finalTranscript.trim();

        if (message === "" || message === lastSentTranscript || isSending) {
            return;
        }

        isSending = true;
        lastSentTranscript = message;

        console.log("Sending:", message);

        try {

            // Replace with your backend call
            

            

        } catch (err) {
            console.error(err);
        }

        finalTranscript = "";
        isSending = false;

    }, SILENCE_DELAY);
}