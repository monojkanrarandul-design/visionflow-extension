document.getElementById('allow-mic-button').addEventListener('click',async()=>{
    try{
        await navigator.mediaDevices.getUserMedia({ audio: true });
        alert("Microphone access granted. You can now use VisionFlow AI following by closing this tab.");
        window.close();
    }catch(err){
        alert("Microphone access denied. Kindly click the icon in the address bar to allow it.");
    }
});