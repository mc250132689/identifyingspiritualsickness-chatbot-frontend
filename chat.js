const API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "user-msg" : "bot-msg";

  // Replace line breaks with <br> and handle simple Markdown
  let formatted = text
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\#\#\s(.*?)(<br>|$)/g, "<h3>$1</h3>"); // optional: ## headings

  msg.innerHTML = formatted;
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

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    const data = await res.json();
    loadingMsg.remove();
    appendMessage("bot", `🤖: ${data.response}`);
  } catch (err) {
    loadingMsg.innerHTML = "🤖: Error connecting to backend.";
  }
}
