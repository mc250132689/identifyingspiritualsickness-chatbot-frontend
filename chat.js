const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

// Detect user language (fallback: browser language)
function detectLanguage(text) {
  text = text.trim();
  if (/[\u0600-\u06FF]/.test(text)) return "ar"; // Arabic script
  if (/[\u4E00-\u9FFF]/.test(text)) return "zh"; // Chinese script just in case
  if (/[\u0E80-\u0EFF]/.test(text)) return "ms"; // Malay Jawi (rare)
  
  // Browser language fallback
  const lang = navigator.language || navigator.userLanguage;
  if (lang.startsWith("ms")) return "ms";
  if (lang.startsWith("ar")) return "ar";
  return "en";
}

// WebSocket connection
const ws = new WebSocket("ws://127.0.0.1:8000/ws/chat");

// Create timestamp string
function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Auto-scroll chat to bottom
function scrollChat() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Add message with timestamp
function addMessage(message, sender) {
  const wrapper = document.createElement("div");
  wrapper.className = sender === "user" ? "user-msg-wrapper" : "bot-msg-wrapper";

  const msgDiv = document.createElement("div");
  msgDiv.className = sender === "user" ? "user-msg" : "bot-msg";
  msgDiv.textContent = message;

  const timeSpan = document.createElement("div");
  timeSpan.className = "timestamp";
  timeSpan.textContent = getTimestamp();

  wrapper.appendChild(msgDiv);
  wrapper.appendChild(timeSpan);

  chatBox.appendChild(wrapper);
  scrollChat();
}

// Typing indicator
function showTyping() {
  hideTyping();
  const typing = document.createElement("div");
  typing.id = "typing";
  typing.className = "bot-msg-wrapper";

  typing.innerHTML = `<div class="bot-msg">✦ Typing...</div>`;
  chatBox.appendChild(typing);
  scrollChat();
}

function hideTyping() {
  const existing = document.getElementById("typing");
  if (existing) existing.remove();
}

// Send message
function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  const lang = detectLanguage(message);

  addMessage(message, "user");
  showTyping();

  ws.send(JSON.stringify({ message: message, lang: lang }));
  userInput.value = "";
}

// Receive bot reply
ws.onmessage = (event) => {
  hideTyping();
  const data = JSON.parse(event.data);

  if (data.reply) addMessage(data.reply, "bot");
};

// Enter key sends message
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
