

//Add visual focus glow to active form elements
document.addEventListener('focusin', (e) => {
    if(['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target.tagName)) {
        e.target.style.outline='4px solid #3b82f6';
    }
});


// This runs in the context of the web page
function getFullHTML() {
  return document.documentElement.outerHTML;
}

