import apiRequest from "./utils/fetch_api.js";
import get_snapshot from "./tools/snapshot.js";
import speak from "./core/tts.js";
import execute from "./action.js";
import { getMemory, setMemory } from "./core/memory.js";
import { startListening, stopListening } from "./voiceInput.js";

const baseUrl = "https://visionflowapi.vercel.app"
// stage 1
async function planner({message, context}){
    const res = await apiRequest({
        url: `${baseUrl}/api/planner`,
        method: "POST",
        data: JSON.stringify({
            "prompt": message,
            "history": context
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    return res
}


function waitForTabLoad(tabId, timeout = 15000) {
  return new Promise((resolve) => {
    let settled = false;

    function finish() {
      if (settled) return;
      settled = true;
      chrome.tabs.onUpdated.removeListener(listener);
      clearTimeout(timer);
      resolve();
    }

    function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        finish();
      }
    }

    chrome.tabs.onUpdated.addListener(listener);
    const timer = setTimeout(finish, timeout);
  });
}


// API call - 
export default async function callAPI(message){
    
    let contextMemory = getMemory();
    const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    console.log("Memory: " + contextMemory);
    stopListening();
    const res_1 = await planner({
        message: message,
        context: contextMemory,
        pageInfo: {
            "title": activeTab.title,
            "url":   activeTab.url
        }
    });

    console.log("Stage 1: " + JSON.stringify(await res_1));
    document.querySelector(".markdown").innerHTML = marked.parse(res_1.markdown);
    setMemory(message, res_1.message);
    speak(res_1.message);
    if(res_1.actions.length > 0){
        for(let action of res_1.actions){
            await execute(action);
        }
    }
    await waitForTabLoad(activeTab.id);
    return true
}