const API = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Add message to chat UI
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send message
async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  // Loading bubble
  const loading = document.createElement("div");
  loading.classList.add("message", "bot");
  loading.innerText = "Typing...";
  chatBox.appendChild(loading);

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    chatBox.removeChild(loading);
    addMessage(data.response, "bot");

  } catch (err) {
    chatBox.removeChild(loading);
    addMessage("⚠️ Server is offline. Try again later.", "bot");
  }
}

sendBtn.onclick = sendMessage;
input.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});
