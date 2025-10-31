// Backend API URLs
const API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";
const TRAIN_DATA_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/get-training-data";

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

// In-memory dictionary for trained Q&A
let trainedAnswers = {};

// Load trained answers from backend
async function loadTrainedAnswers() {
  try {
    const res = await fetch(TRAIN_DATA_URL);
    const data = await res.json();
    if (data.training_data && Array.isArray(data.training_data)) {
      trainedAnswers = {};
      data.training_data.forEach(item => {
        trainedAnswers[item.question.toLowerCase()] = item.answer;
      });
    }
    console.log("Loaded trained answers:", Object.keys(trainedAnswers).length);
  } catch (err) {
    console.error("Failed to load trained answers:", err);
  }
}

// Initial load
loadTrainedAnswers();

// Auto-refresh trained answers every 30 seconds
setInterval(loadTrainedAnswers, 30000);

// Add new trained answer dynamically
window.chatAddTrainedAnswer = (question, answer) => {
  trainedAnswers[question.toLowerCase()] = answer;
};

// Append message to chat
function appendMessage(userText, botText) {
  const container = document.createElement("div");
  container.className = "message-pair";

  const userMsg = document.createElement("div");
  userMsg.className = "user-msg";
  userMsg.innerHTML = userText;
  container.appendChild(userMsg);

  const botMsg = document.createElement("div");
  botMsg.className = "bot-msg";
  botMsg.innerHTML = botText || "🤲 Generating response...";
  container.appendChild(botMsg);

  chatBox.appendChild(container);
  chatBox.scrollTop = chatBox.scrollHeight;

  return botMsg;
}

// Send message
async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  input.value = "";

  // Check trained answers first
  const trained = trainedAnswers[userText.toLowerCase()];
  if (trained) {
    appendMessage(`🧍: ${userText}`, `🤖: ${trained}`);
    return;
  }

  const botMsgElem = appendMessage(`🧍: ${userText}`, null);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    const data = await res.json();

    let formatted = data.response
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\#\#\s(.*?)(<br>|$)/g, "<h3>$1</h3>")
      .replace(/\|(.+?)\|/gs, (match) => {
        const rows = match.trim().split("<br>").filter(r => r.trim());
        const tableRows = rows.map(row => {
          const cols = row.split("|").map(c => c.trim()).filter(c => c);
          return "<tr>" + cols.map(c => `<td>${c}</td>`).join("") + "</tr>";
        }).join("");
        return `<table class="chat-table">${tableRows}</table>`;
      });

    botMsgElem.innerHTML = `🤖: ${formatted}`;
  } catch (err) {
    botMsgElem.innerHTML = "🤖: Error connecting to backend.";
    console.error(err);
  }
}

// ENTER = send, SHIFT+ENTER = newline
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
