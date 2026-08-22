import apiRequest from "./utils/fetch_api.js";
import get_snapshot from "./tools/snapshot.js";
import speak from "./core/tts.js";
import execute from "./action.js";
import { getMemory, setMemory } from "./core/memory.js";
import { startListening, stopListening } from "./voiceInput.js";

const baseUrl = "https://visionflowapi.vercel.app";

// Stage 1: Text & Context Planner
async function planner({ message, context, pageInfo }) {
  const res = await apiRequest({
    url: `${baseUrl}/api/planner`,
    method: "POST",
    data: JSON.stringify({
      prompt: message,
      history: context,
      pageInfo: pageInfo // Correctly passed to the backend
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  return res;
}

// Stage 2: Visual Planner (For screenshots / DOM context)
async function visualPlanner({ snapshot = "", intent, instruction, history }) {
  const res = await apiRequest({
    url: `${baseUrl}/api/visual-planner`,
    method: "POST",
    data: JSON.stringify({
      intent: intent,
      instruction: instruction,
      snapshot: snapshot,
      history: history
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  return res;
}

// Main API Orchestrator
export default async function callAPI(message) {
  try {
    // 1. Pause listening while processing / speaking
    stopListening();

    // 2. Gather context & active tab info
    let contextMemory = getMemory();
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    console.log("Memory:", contextMemory);

    // 3. Request actions/response from the backend planner
    const res_1 = await planner({
      message: message,
      context: contextMemory,
      pageInfo: {
        title: activeTab?.title || "",
        url: activeTab?.url || ""
      }
    });

    console.log("Stage 1 Response:", res_1);

    // 4. Update UI with Markdown if element exists
    const markdownEl = document.querySelector(".markdown");
    if (markdownEl && res_1?.markdown) {
      markdownEl.innerHTML = window.marked ? window.marked.parse(res_1.markdown) : res_1.markdown;
    }

    // 5. Update Memory & Speak response
    if (res_1?.message) {
      setMemory(message, res_1.message);
      speak(res_1.message);
    }

    // 6. Execute actions in sequence
    if (res_1?.actions && res_1.actions.length > 0) {
      for (const action of res_1.actions) {
        await execute(action);
      }
    }

    return false; // Sets isListening to false in voiceInput.js until restarted
  } catch (error) {
    console.error("Error in callAPI:", error);
    return false;
  }
}

export { planner, visualPlanner };