import callAPI from "./api.js";
// import {startListening, stopListening } from "./voiceInput"

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

const SILENCE_DELAY = 2000;

export function startListening() {
    if (isListening) return;
    recognition.start();
}

export function stopListening() {
    recognition.stop()
}

recognition.onstart = () => {
    isListening = true;
    document.querySelector(".status").innerHTML = "Listening...";
}

recognition.onend = () => {
    isListening = false;
    document.querySelector(".status").innerHTML = "Listening...";

    setTimeout(() => {
        if (!isListening) {
            recognition.start();
        }
    }, 300);
}

recognition.onerror = (event) => {
    console.log("Speech Error:", event.error);
    if (event.error === "no-speech") return;
};

recognition.onresult = (event) => {
    console.log(event);
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
    document.querySelector(".status").innerHTML = `${interimTranscript}`

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
        document.querySelector(".status").innerHTML = `<strong>Sending: </strong> ${message}`

        try {
            // backend call
            callAPI(message)

        } catch (err) {
            console.error(err);
        }

        finalTranscript = "";
        isSending = false;

    }, SILENCE_DELAY);
}

export default {startListening, stopListening};