const API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "user-msg" : "bot-msg";
  msg.innerHTML = text.replace(/\n/g, "<br>");
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  appendMessage("user", `🧍: ${userText}`);
  input.value = "";

  const loadingMsg = document.createElement("div");
  loadingMsg.className = "bot-msg";
  loadingMsg.textContent = "🤲 Generating response...";
  chatBox.appendChild(loadingMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText }),
  });

  const data = await res.json();
  loadingMsg.innerHTML = `🤖: ${data.response}`;
}
