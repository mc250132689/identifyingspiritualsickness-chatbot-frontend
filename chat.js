// Backend API URLs - adjust domain if needed
const BASE = "https://identifyingspiritualsickness-chatbot.onrender.com";
const API_URL = `${BASE}/chat`;
const ASSESS_URL = `${BASE}/assess`;
const TRAIN_DATA_URL = `${BASE}/get-training-data`;

const chatBox = document.getElementById("chat-box");
const miniFeed = document.getElementById("mini-feed");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const assessBtn = document.getElementById("assess-btn");
const assessmentText = document.getElementById("assessment-text");

function appendMessage(userText, botText, isHtml=false) {
  const container = document.createElement("div");
  container.className = "message-pair";

  const userMsg = document.createElement("div");
  userMsg.className = "user-msg";
  userMsg.textContent = userText;
  container.appendChild(userMsg);

  const botMsg = document.createElement("div");
  botMsg.className = "bot-msg";
  botMsg.innerHTML = isHtml ? botText : (botText || "Generating...");
  container.appendChild(botMsg);

  chatBox.appendChild(container);
  chatBox.scrollTop = chatBox.scrollHeight;
  return botMsg;
}

function appendMiniFeed(text) {
  const el = document.createElement("div");
  el.style.padding = "6px 8px";
  el.style.borderBottom = "1px solid #eef7f1";
  el.textContent = `${new Date().toLocaleTimeString()} — ${text}`;
  miniFeed.prepend(el);
  while (miniFeed.childNodes.length > 50) miniFeed.removeChild(miniFeed.lastChild);
}

// Send chat message
async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;
  input.value = "";
  const botElem = appendMessage(`You: ${userText}`, null);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({message: userText})
    });
    const data = await res.json();
    botElem.innerHTML = data.response;
    appendMiniFeed(`Q: ${userText}`);
  } catch (err) {
    botElem.innerHTML = "Error connecting to backend.";
    console.error(err);
  }
}

// Run assessment
async function runAssessment() {
  const text = assessmentText.value.trim();
  if (!text) return alert("Please describe symptoms for assessment.");
  const respElem = appendMessage(`Assessment: ${text}`, "Running assessment...");
  try {
    const res = await fetch(ASSESS_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({text})
    });
    const data = await res.json();
    if (data.result) {
      const plan = data.result.ruqyah_plan.replace(/\n/g, "<br>");
      respElem.innerHTML = `<strong>Assessment:</strong> Probable: ${data.result.assessment.probable.join(", ")}<br><br><strong>Plan:</strong><br>${plan}`;
      appendMiniFeed("New assessment run");
    } else {
      respElem.innerHTML = "No result from assessment.";
    }
  } catch (err) {
    respElem.innerHTML = "Error running assessment.";
    console.error(err);
  }
}

// Wire buttons
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e)=>{ if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }});
assessBtn.addEventListener("click", runAssessment);

// Load initial mini-feed (last few chats) - just request the training endpoint publicly is protected
async function loadRecent() {
  try {
    const res = await fetch("/get-recent-cache.json"); // optional local cache - may not exist
    // ignore if fails
  } catch(e){}
}
loadRecent();
