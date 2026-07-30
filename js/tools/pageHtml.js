console.log("pageHtml.js loaded");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get-html") {
        sendResponse({
            html: document.documentElement.outerHTML
        });
    }
});