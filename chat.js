// Backend API URLs
const API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";
const TRAIN_DATA_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/get-training-data";

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// In-memory dictionary for trained Q&A
let trainedAnswers = {};

function normalizeText(s) {
  if (!s) return "";
  return s.toString().toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Load trained answers from backend, but persist to localStorage for browser-close persistence
async function loadTrainedAnswers() {
  try {
    const res = await fetch(TRAIN_DATA_URL);
    const data = await res.json();
    if (data.training_data && Array.isArray(data.training_data)) {
      trainedAnswers = {};
      data.training_data.forEach(item => {
        trainedAnswers[item.question.toLowerCase()] = item.answer;
      });
      // save to localStorage for persistence across browser restarts
      localStorage.setItem('trained_answers_cache', JSON.stringify(data.training_data));
    }
    console.log("Loaded trained answers:", Object.keys(trainedAnswers).length);
  } catch (err) {
    console.error("Failed to load trained answers:", err);
    // fallback to localStorage if backend unreachable
    const cached = localStorage.getItem('trained_answers_cache');
    if (cached) {
      try {
        const arr = JSON.parse(cached);
        trainedAnswers = {};
        arr.forEach(item => trainedAnswers[item.question.toLowerCase()] = item.answer);
        console.log('Loaded trained answers from localStorage:', Object.keys(trainedAnswers).length);
      } catch (e) {
        console.error('Invalid localStorage cache', e);
      }
    }
  }
}

// Initial load
loadTrainedAnswers();

// Auto-refresh trained answers every 30 seconds
setInterval(loadTrainedAnswers, 30000);

// Add new trained answer dynamically
window.chatAddTrainedAnswer = (question, answer) => {
  trainedAnswers[question.toLowerCase()] = answer;
  // update localStorage cache too
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

// Format bot answer with preserved spacing, paragraphs, bold/italic, tables
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

  // Check trained answers first using normalized matching
  const normalizedUser = normalizeText(userText);
  // try exact normalized match
  let trainedKey = Object.keys(trainedAnswers).find(k => normalizeText(k) === normalizedUser);
  // fallback: fuzzy by normalized startsWith or includes
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

    // Update local trained cache with this new pair for offline persistence
    try {
      const cached = JSON.parse(localStorage.getItem('trained_answers_cache') || '[]');
      cached.push({ question: userText, answer: data.response, lang: 'en' });
      localStorage.setItem('trained_answers_cache', JSON.stringify(cached));
      // also update in-memory
      trainedAnswers[userText.toLowerCase()] = data.response;
    } catch (e) { console.warn(e); }

  } catch (err) {
    botMsgElem.innerHTML = "🤖: Error connecting to backend.";
    console.error(err);
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
