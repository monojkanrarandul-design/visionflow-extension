let data = localStorage.getItem("memory");
if(data == null) {
    localStorage.setItem("memory", "[]")
}

const getMemory = () => {
    return localStorage.getItem("memory");
}

const setMemory = (message, reply) => {
    let arr = JSON.parse(localStorage.getItem("memory"));
    if (arr.length >= 5){
        arr = arr.slice(1);
    }
    arr.push({
        message: message,
        reply: reply
    })
    localStorage.setItem("memory", JSON.stringify(arr));
}

export {getMemory, setMemory}