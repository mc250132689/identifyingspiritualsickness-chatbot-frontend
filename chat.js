const API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

// In-memory dictionary for trained Q&A
const trainedAnswers = {};

window.chatAddTrainedAnswer = (question, answer) => {
  trainedAnswers[question.toLowerCase()] = answer;
};

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

// --- ENTER / SHIFT+ENTER functionality ---
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (e.shiftKey) {
      // Allow newline with SHIFT+ENTER
      return;
    } else {
      // ENTER alone sends message
      e.preventDefault();
      sendMessage();
    }
  }
});

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
      .replace(/\#\#\s(.*?)(<br>|$)/g, "<h3>$1</h3>");

    botMsgElem.innerHTML = `🤖: ${formatted}`;
  } catch (err) {
    botMsgElem.innerHTML = "🤖: Error connecting to backend.";
  }
}
