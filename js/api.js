import apiRequest from "./utils/fetch_api";

const baseUrl = "https://visionflowapi.vercel.app"
// stage 1
function verifyIntent(q){
    const res = apiRequest({
        url: baseUrl,
        method: "POST",
        data: JSON.stringify({
            "q": q
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
}