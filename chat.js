const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message-pair");
  const msgContent = document.createElement("div");
  msgContent.className = sender === "user" ? "user-msg" : "bot-msg";
  msgContent.innerHTML = text.replace(/\n/g, "<br>");
  msgDiv.appendChild(msgContent);
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;
  appendMessage("user", msg);
  userInput.value = "";
  try {
    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json();
    appendMessage("bot", data.response);
  } catch (err) {
    appendMessage("bot", "❌ Error connecting to server.");
  }
}
