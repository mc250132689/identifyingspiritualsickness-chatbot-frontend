const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");
const loading = document.getElementById("loading");

async function sendMessage() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  appendMessage("🧍", userMessage);
  userInput.value = "";

  const language = detectLanguage(userMessage);
  loading.style.display = "block";

  try {
    const response = await fetch("https://identifyingspiritualsickness-chatbot.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, language }),
    });

    const data = await response.json();
    appendMessage("🤖", formatResponse(data.reply));
  } catch {
    appendMessage("🤖", "⚠️ Error connecting to backend.");
  } finally {
    loading.style.display = "none";
  }
}

function detectLanguage(text) {
  const t = text.toLowerCase();
  const bmWords = ["saya", "jin", "sihir", "ruqyah", "ustaz", "gangguan"];
  const arWords = ["الله", "القرآن", "الجن", "رقية", "سحر", "دعاء"];
  if (arWords.some((w) => t.includes(w))) return "ar";
  if (bmWords.some((w) => t.includes(w))) return "bm";
  return "en";
}

function appendMessage(sender, message) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<b>${sender}:</b><br>${message}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function formatResponse(text) {
  return text
    .replace(/\n{2,}/g, "<br><br>")
    .replace(/## (.+)/g, "<b>$1</b>")
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/- /g, "• ");
}

sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
