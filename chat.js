// Backend API URLs
const API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";
const GUIDANCE_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/guidance";
const TRAIN_DATA_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/get-training-data";

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// --- Utilities ---
function scrollToBottomSmooth() {
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
}

function resizeTextarea() {
  input.style.height = 'auto';
  input.style.height = input.scrollHeight + 'px';
  scrollToBottomSmooth();
}
input.addEventListener('input', resizeTextarea);

function normalizeText(s) {
  if (!s) return "";
  return s.toString().toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// --- Load trained answers from backend ---
let trainedAnswers = {};
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
      } catch (e) { console.error(e); }
    }
  }
}
loadTrainedAnswers();
setInterval(loadTrainedAnswers, 5000); // 🔄 Auto-refresh trained answers every 5 seconds

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
  scrollToBottomSmooth();
  return botMsg;
}

function formatBotAnswer(text) {
  if (!text) return "";
  return text
    .replace(/\r\n|\r|\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\#\#\s(.*?)(<br>|$)/g, "<h3>$1</h3>");
}

// --- MAIN SEND FUNCTION ---
async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  input.value = "";
  resizeTextarea();

  const normalizedUser = normalizeText(userText);

  // 1️⃣ Check for trained answers
  let trainedKey = Object.keys(trainedAnswers).find(k => normalizeText(k) === normalizedUser);
  if (!trainedKey) {
    trainedKey = Object.keys(trainedAnswers).find(k => normalizeText(k).includes(normalizedUser));
  }
  if (trainedKey) {
    appendMessage(`🧍: ${userText}`, `🤖: ${formatBotAnswer(trainedAnswers[trainedKey])}`);
    return;
  }

  // 2️⃣ Symptom-like input detection
  const symptomKeywords = ["voices","see","hearing","insomnia","nightmares","dizziness","sudden pain","bad luck","family problem","marriage problem","fear"];
  const isSymptom = symptomKeywords.some(k => normalizedUser.includes(k));

  const botMsgElem = appendMessage(`🧍: ${userText}`, null);

  if (isSymptom) {
    try {
      const res = await fetch(GUIDANCE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: userText })
      });
      const data = await res.json();
      let suggestionsHtml = data.suggestions?.map(s => `• ${s}`).join("<br>") || "";
      let stepsHtml = data.recommended_steps?.length ? "<br><strong>Recommended Steps:</strong><br>" + data.recommended_steps.join("<br>") : "";
      botMsgElem.innerHTML = `🤖: <strong>Severity:</strong> ${data.severity}<br>${suggestionsHtml}${stepsHtml}`;
      scrollToBottomSmooth();
      return;
    } catch (err) {
      botMsgElem.innerHTML = "🤖: Error connecting to backend for guidance.";
      console.error(err);
      return;
    }
  }

  // 3️⃣ General GPT response
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText })
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

    scrollToBottomSmooth();
  } catch (err) {
    botMsgElem.innerHTML = "🤖: Error connecting to backend.";
    console.error(err);
    scrollToBottomSmooth();
  }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
