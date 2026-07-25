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

    // 1. Get current  active tab in FireFox
    const tabs=await chrome.tabs.query({active:true,currentWindow:true});
    const activeTab=tabs[0];

    if(!activeTab) return;
    speak(`Processing command: ${command}`);

    // 2. Inject and execute action script on the web page Firefox MV2 style
    const codeToInject=`(${executeUserAction.toString()})("${command.replace(/"/g,'\\"')}")`;
    browser.tabs.executeScript(activeTab.id,{
        code: codeToInject
    });
};

//Injected function executed directly on the user's webpage 
function executeUseraction(command){
    const lowerCmd = command.toLowerCase();

    //Smart matching logic (replace/Supplement with Gemini API if needed)
    
        
    if(lowerCmd.includes("fill name") || lowerCmd.includes("my name is")){
        const nameInput=document.querySelector('input[name="name"],input[placeholder*="Name"],input[id*="name"]');
        if(nameInput){
            const nameVal=command.includes("is ") ? command.split("is ").pop() : "Alex Vance";
            nameInput.value=nameVal;
            nameInput.style.border="3px solid #22c55e";
        }
    }else if(lowerCmd.includes("submit") || lowerCmd.includes("click button")){
        const btn=document.querySelector('button[type="submit"],input[type="submit"],button');
        if(btn){
            btn.click();
            btn.style.border="3px solid #22c55e";
        }
    }
        
}
