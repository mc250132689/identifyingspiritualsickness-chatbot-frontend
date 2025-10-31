const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const status = document.getElementById("status");

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("🧍", message);
  userInput.value = "";

  status.innerText = "🤲 Generating response...";
  try {
    const res = await fetch("https://identifyingspiritualsickness-chatbot.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    const data = await res.json();
    appendMessage("🤖", data.response);
  } catch (err) {
    appendMessage("🤖", "⚠️ Error: Cannot connect to the server.");
  }
  status.innerText = "🤲 Ready to assist...";
}

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message");
  msg.innerHTML = `<b>${sender}:</b> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
