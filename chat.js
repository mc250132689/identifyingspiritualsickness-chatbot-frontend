// Backend API URLs
const CHAT_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";
const TRAIN_DATA_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/get-training-data";
const GUIDANCE_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/guidance";

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Smooth scroll
function scrollToBottomSmooth() {
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
}

// Dynamic textarea resize
function resizeTextarea() {
  input.style.height = 'auto';
  input.style.height = input.scrollHeight + 'px';
  scrollToBottomSmooth();
}
input.addEventListener('input', resizeTextarea);

// Trained Q&A cache
let trainedAnswers = {};

// Load trained answers from backend and localStorage cache
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
  } catch (err) {
    const cached = localStorage.getItem('trained_answers_cache');
    if (cached) {
      try {
        const arr = JSON.parse(cached);
        trainedAnswers = {};
        arr.forEach(item => trainedAnswers[item.question.toLowerCase()] = item.answer);
      } catch (e) { console.warn('Invalid localStorage cache', e); }
    }
  }
}
loadTrainedAnswers();
setInterval(loadTrainedAnswers, 30000);

// Add new trained Q&A dynamically
window.chatAddTrainedAnswer = (question, answer) => {
  trainedAnswers[question.toLowerCase()] = answer;
  try {
    const cached = JSON.parse(localStorage.getItem('trained_answers_cache') || '[]');
    cached.push({ question, answer, lang: 'en' });
    localStorage.setItem('trained_answers_cache', JSON.stringify(cached));
  } catch (e) { console.warn(e); }
};

// Normalize text
function normalizeText(s) {
  if (!s) return "";
  return s.toString().toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Append message
function appendMessage(userText, botText, botElem=null) {
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
  scrollToBottomSmooth();

  return botMsg;
}

// Format bot answer (support tables, headings)
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
  resizeTextarea();

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
    const res = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });
    const data = await res.json();

    // Append bot response
    botMsgElem.innerHTML = `🤖: ${formatBotAnswer(data.response)}`;

    // Update local trained cache
    try {
      const cached = JSON.parse(localStorage.getItem('trained_answers_cache') || '[]');
      cached.push({ question: userText, answer: data.response, lang: 'en' });
      localStorage.setItem('trained_answers_cache', JSON.stringify(cached));
      trainedAnswers[userText.toLowerCase()] = data.response;
    } catch (e) { console.warn(e); }

    scrollToBottomSmooth();

  } catch (err) {
    botMsgElem.innerHTML = "🤖: Error connecting to backend.";
    console.error(err);
    scrollToBottomSmooth();
  }
}

// Send on button click or Enter key
sendBtn.addEventListener('click', sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Optional: Guidance feature integration (if you want symptom-based advice button)
/*
async function requestGuidance(symptomsText) {
  try {
    const res = await fetch(GUIDANCE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: symptomsText }),
    });
    const data = await res.json();
    appendMessage(`🧍: ${symptomsText}`, `🤖: Guidance severity: ${data.severity}<br>${data.suggestions.join("<br>")}`);
  } catch (err) {
    console.error(err);
  }
}
*/
