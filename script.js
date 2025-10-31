const CHAT_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML += `<div class="user">🧍: ${message}</div>`;
  input.value = "";

  try {
    const res = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    chatBox.innerHTML += `<div class="bot">🤖: ${data.reply}</div>`;
  } catch (err) {
    chatBox.innerHTML += `<div class="error">⚠️ Error: ${err.message}</div>`;
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}
