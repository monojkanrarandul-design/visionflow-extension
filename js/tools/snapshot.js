export const getPageHtml = async () => {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    const response = await chrome.tabs.sendMessage(tab.id, {
        action: "get-html"
    });
}

