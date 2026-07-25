const statusDiv=document.getElementById('status');
const startBtn=document.getElementById('start-btn');
//Initial Web Search API
const SpeechRecognition=window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition=new SpeechRecognition();
recognition.continuous=false;
recognition.lang='en-US';
//Speak text back to the user
function speak(text){
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

startBtn.addEventListener('click',()=>{
    recognition.start();
    statusDiv.innerText='Listening...';
});

recognition.onresult=async (event)=>{
    const command=event.results[0][0].transcript;
    statusDiv.innertext=`You said: ${command}`;

    // 1. Get current  active tab
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});

    // 2. Execute script on page to scrape inputs
    const [{result: pageContext}]=await chrome.scripting.executeScript({
        target:{tabId: tab.Id},
        func:()=>{
            const inputs = Array.from(document.querySelectorAll('input, button, textarea, select')).map((el,i)=>({
                index:i,
                tag:el.tagName,
                type:el.type || '',
                placeholder:el.placeholder || '',
                id: el.id || '',
                label: el.labels?.[0]?.innerText || el.innerText || ''
            }));
            return inputs;
        }
    });

    // 3. Process action (Mocked LLM mapping for demo reliability)
    speak(`Processing command: ${command}`);

    //Send execution command to content script
    chrome.scripting.executeScript({
        target:{tabId: tab.id},
        func: executeUseraction,
        args: [command,pageContext]
    });
};

//Injected function executed directly on the user's webpage 
function executeUseraction(command, context){
    const lowerCmd = command.toLowerCase();

    //Smart matching logic (replace/Supplement with Gemini API if needed)
    if(lowerCmd.includes("fill name") || lowerCmd.includes("my name is")){
        const nameInput=document.querySelector('input[name*="name"],input[placeholder*="Name"],input[id*="name"]');
        if (nameInput){
            const nameVal=command.split("is ").pop() || "Alex Vance";
            nameInput.value=nameVal;
            nameInput.style.border='3px solid #22c55e';
        }
        else if(lowerCmd.includes("submit") || lowerCmd.includes("click button")){
            const btn=document.querySelector('button[type="submit"],input[type="submit"],button');
            if(btn){
                btn.click();
                alert("Form submitted!");
            }
        }
    }
}