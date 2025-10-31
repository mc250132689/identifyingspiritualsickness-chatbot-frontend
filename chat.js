const API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/chat";
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

// In-memory dictionary for trained Q&A
const trainedAnswers = {};

window.chatAddTrainedAnswer = (question, answer) => {
  trainedAnswers[question.toLowerCase()] = answer;
};

// Function to format bot responses
function formatBotResponse(text) {
  if (!text) return "";

  const lines = text.split("\n");
  return lines.map(line => {
    // Numbered list
    if (line.match(/^\d+\./)) {
      return "<br><strong>" + line + "</strong>";
    }
    // Bullets
    else if (line.startsWith("-")) {
      return "&nbsp;&nbsp;" + line + "<br>";
    }
    // Headers with ##
    else if (line.startsWith("## ")) {
      return "<h3>" + line.replace("## ", "") + "</h3>";
    }
    // Bold and italics (markdown-style)
    line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    line = line.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Empty lines
    if (line.trim() === "") return "<br>";
    return line + "<br>";
  }).join("");
}

function appendMessage(userText, botText) {
  const container = document.createElement("div");
  container.className = "message-pair";

  const userMsg = document.createElement("div");
  userMsg.className = "user-msg";
  userMsg.innerHTML = userText.replace(/\n/g, "<br>");
  container.appendChild(userMsg);

  const botMsg = document.createElement("div");
  botMsg.className = "bot-msg";
  botMsg.innerHTML = botText || "🤲 Generating response...";
  container.appendChild(botMsg);

  chatBox.appendChild(container);
  chatBox.scrollTop = chatBox.scrollHeight;

  return botMsg;
}

// ENTER / SHIFT+ENTER
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (e.shiftKey) return; // allow newline
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  input.value = "";

  // Check trained answers first
  const trained = trainedAnswers[userText.toLowerCase()];
  if (trained) {
    appendMessage(`🧍: ${userText}`, `🤖: ${formatBotResponse(trained)}`);
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
    botMsgElem.innerHTML = `🤖: ${formatBotResponse(data.response)}`;
  } catch (err) {
    botMsgElem.innerHTML = "🤖: Error connecting to backend.";
  }
}
