import apiRequest from "./utils/fetch_api.js";
import get_snapshot from "./tools/snapshot.js";


const baseUrl = "https://visionflowapi.vercel.app"
// stage 1
async function planner(message, context){
    const res = await apiRequest({
        url: `${baseUrl}/api/classify`,
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

async function visualPlanner({snapshot = "", intent, message}) {
    const res = await apiRequest({
        url: `${baseUrl}/api/ai-response`,
        method: "POST",
        data: JSON.stringify({
            "intent": intent,
            "message": message,
            "snapshot": snapshot
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    return res
}

export default async function callAPI(message){
    const res = await planner(message);
    console.log(await res);

    const response = await getActions({
        intent: await res.intent,
        message: message,
        snapshot: (await res.snapshot)? await get_snapshot() : ""
    })

    console.log(JSON.stringify(await response));
    document.querySelector(".markdown").innerHTML = marked.parse((await response).markdown);
    const utterance = new SpeechSynthesisUtterance(((await response).message));
    speechSynthesis.speak(utterance);
}