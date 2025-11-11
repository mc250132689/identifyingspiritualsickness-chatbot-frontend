// Backend API URLs
const API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";
const TRAIN_DATA_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/get-training-data";
const GUIDANCE_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/guidance";

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Function to smoothly scroll chat to bottom
function scrollToBottomSmooth() {
  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth'
  });
}

// Function to resize textarea dynamically
function resizeTextarea() {
  input.style.height = 'auto'; // reset height
  input.style.height = input.scrollHeight + 'px'; // grow/shrink dynamically
  scrollToBottomSmooth(); // scroll chat to bottom while typing
}

// Listen for input events to resize textarea
input.addEventListener('input', resizeTextarea);

// In-memory dictionary for trained Q&A
let trainedAnswers = {};

function normalizeText(s) {
  if (!s) return "";
  return s.toString().toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Load trained answers from backend, persist to localStorage
async function loadTrainedAnswers() {
  try {
    const res = await fetch(TRAIN_DATA_URL);
    const data = await res.json();
    if (data.training_data && Array.isArray(data.training_data)) {
      trainedAnswers = {};
      data.training_data.forEach(item => {
        trainedAnswers[item.question.toLowerCase()] = item.answer;
      });
      localStorage.setItem('trained_answers_cache', JSON.stringify(data.training_data));
    }
    console.log("Loaded trained answers:", Object.keys(trainedAnswers).length);
  } catch (err) {
    console.error("Failed to load trained answers:", err);
    const cached = localStorage.getItem('trained_answers_cache');
    if (cached) {
      try {
        const arr = JSON.parse(cached);
        trainedAnswers = {};
        arr.forEach(item => trainedAnswers[item.question.toLowerCase()] = item.answer);
        console.log('Loaded trained answers from localStorage:', Object.keys(trainedAnswers).length);
      } catch (e) { console.error('Invalid localStorage cache', e); }
    }
  }
}

// Initial load
loadTrainedAnswers();
setInterval(loadTrainedAnswers, 30000);

// Add new trained answer dynamically
window.chatAddTrainedAnswer = (question, answer) => {
  trainedAnswers[question.toLowerCase()] = answer;
  try {
    const cached = JSON.parse(localStorage.getItem('trained_answers_cache') || '[]');
    cached.push({ question, answer, lang: 'en' });
    localStorage.setItem('trained_answers_cache', JSON.stringify(cached));
  } catch (e) { console.warn(e); }
};

// Append message to chat
function appendMessage(userText, botText) {
  const container = document.createElement("div");
  container.className = "message-pair";

  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.innerHTML = userText;
  container.appendChild(userMsg);

  const botMsg = document.createElement("div");
  botMsg.className = "message bot";
  botMsg.innerHTML = botText || "🤲 Generating response...";
  container.appendChild(botMsg);

  chatBox.appendChild(container);
  scrollToBottomSmooth(); // smooth scroll when new message added

  return botMsg;
}

// Format bot answer
function formatBotAnswer(text) {
  if (!text) return "";

  let formatted = text
    .replace(/\r\n|\r|\n/g, "<br>")
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

  return formatted;
}

// Send message
async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  input.value = "";
  resizeTextarea(); // shrink textarea after sending

  const normalizedUser = normalizeText(userText);
  let trainedKey = Object.keys(trainedAnswers).find(k => normalizeText(k) === normalizedUser);
  if (!trainedKey) {
    trainedKey = Object.keys(trainedAnswers).find(k => normalizeText(k).startsWith(normalizedUser) || normalizeText(k).includes(normalizedUser));
  }

  if (trainedKey) {
    appendMessage(`🧍: ${userText}`, `🤖: ${formatBotAnswer(trainedAnswers[trainedKey])}`);
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

    // Update local trained cache
    try {
      const cached = JSON.parse(localStorage.getItem('trained_answers_cache') || '[]');
      cached.push({ question: userText, answer: data.response, lang: 'en' });
      localStorage.setItem('trained_answers_cache', JSON.stringify(cached));
      trainedAnswers[userText.toLowerCase()] = data.response;
    } catch (e) { console.warn(e); }

    scrollToBottomSmooth(); // smooth scroll after receiving response

  } catch (err) {
    botMsgElem.innerHTML = "🤖: Error connecting to backend.";
    console.error(err);
    scrollToBottomSmooth();
  }
}

// Send on button click
sendBtn.addEventListener('click', sendMessage);

// ENTER = send, SHIFT+ENTER = newline
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
