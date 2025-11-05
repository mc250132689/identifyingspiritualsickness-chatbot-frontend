const API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";
const TRAIN_DATA_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/get-training-data";

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

let trainedAnswers = {};

// Load trained answers from backend
async function loadTrainedAnswers() {
  try {
    const res = await fetch(TRAIN_DATA_URL);
    const data = await res.json();
    trainedAnswers = {};
    data.training_data.forEach(item => {
      trainedAnswers[item.question.toLowerCase()] = item.answer;
    });
    console.log("Loaded trained answers:", Object.keys(trainedAnswers).length);
  } catch (err) {
    console.error("Failed to load trained answers:", err);
  }
}

loadTrainedAnswers();
setInterval(loadTrainedAnswers, 30000);

function appendMessage(userText, botText) {
  const container = document.createElement("div");
  container.className = "message-pair";

  const userMsg = document.createElement("div");
  userMsg.className = "user-msg";
  userMsg.textContent = userText;
  container.appendChild(userMsg);

  const botMsg = document.createElement("div");
  botMsg.className = "bot-msg";
  botMsg.innerHTML = botText || "🤲 Generating response...";
  container.appendChild(botMsg);

  chatBox.appendChild(container);
  chatBox.scrollTop = chatBox.scrollHeight;

  return botMsg;
}

function formatBotAnswer(text) {
  if (!text) return "";
  return text
    .replace(/\r\n|\r|\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}

async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;
  input.value = "";

  const trained = trainedAnswers[userText.toLowerCase()];
  if (trained) {
    appendMessage(`🧍: ${userText}`, `🤖: ${formatBotAnswer(trained)}`);
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
    botMsgElem.innerHTML = `🤖: ${formatBotAnswer(data.response)}`;
  } catch (err) {
    botMsgElem.innerHTML = "🤖: Error connecting to backend.";
    console.error(err);
  }
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
