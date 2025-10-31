const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const trainBtn = document.getElementById("train-btn");

// change this to your Render backend URL
const API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";      // for chat
const TRAIN_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/train";  // for train


function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", async () => {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage("user", text);
  userInput.value = "";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    appendMessage("bot", data.reply || "No response.");
  } catch {
    appendMessage("bot", "⚠️ Error connecting to backend.");
  }
});

trainBtn.addEventListener("click", async () => {
  const q = document.getElementById("train-q").value.trim();
  const a = document.getElementById("train-a").value.trim();
  if (!q || !a) return alert("Please fill both fields!");

  try {
    const res = await fetch(`${API_URL}/train`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, answer: a }),
    });
    const data = await res.json();
    alert(data.message || "Training added!");
  } catch {
    alert("⚠️ Training failed.");
  }
});
