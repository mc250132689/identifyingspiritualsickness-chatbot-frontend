const API_CHAT = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";
const API_FEEDBACK = "https://identifyingspiritualsickness-chatbot.onrender.com/feedback";

const chatBox = document.getElementById("chat-box");
const form = document.getElementById("composer");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

const fbOpen = document.getElementById("feedback-open");
const fbModal = document.getElementById("feedback-modal");
const fbClose = document.getElementById("feedback-close");
const fbText = document.getElementById("fb-text");
const fbSend = document.getElementById("fb-send");

// helpers
function addMessage(text, who, time = new Date()){
  const el = document.createElement("div");
  el.className = `msg ${who}`;
  el.innerHTML = `<div>${text}</div><div class="meta">${new Date(time).toLocaleString()}</div>`;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function addTyping(){
  const el = document.createElement("div");
  el.className = "msg bot typing";
  el.id = "typing";
  el.innerText = "Typing...";
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function removeTyping(){
  const t = document.getElementById("typing");
  if(t) t.remove();
}

// send chat
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if(!message) return;
  addMessage(message, "user");
  input.value = "";
  addTyping();
  try {
    const res = await fetch(API_CHAT, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({message})
    });
    const data = await res.json();
    removeTyping();
    if(data && data.response){
      addMessage(data.response, "bot");
    } else {
      addMessage("⚠️ No response from server.", "bot");
    }
  } catch (err) {
    removeTyping();
    addMessage("⚠️ Server error. Please try later.", "bot");
  }
});

// feedback modal
fbOpen.addEventListener("click", ()=>{ fbModal.setAttribute("aria-hidden","false"); });
fbClose.addEventListener("click", ()=>{ fbModal.setAttribute("aria-hidden","true"); });
fbSend.addEventListener("click", async ()=>{
  const text = fbText.value.trim();
  if(!text) return alert("Write feedback.");
  fbSend.disabled = true;
  try {
    const res = await fetch(API_FEEDBACK, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({text})
    });
    const data = await res.json();
    alert(data.message || "Thanks — feedback submitted.");
    fbText.value = "";
    fbModal.setAttribute("aria-hidden","true");
  } catch (err) {
    alert("Unable to send feedback.");
  } finally { fbSend.disabled = false; }
});

// accessibility: close modal on outside click
fbModal.addEventListener("click", (e)=>{
  if(e.target === fbModal) fbModal.setAttribute("aria-hidden","true");
});
