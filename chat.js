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

  // User message
  const userMsg = document.createElement("div");
  userMsg.className = "user-msg";
  userMsg.innerHTML = userText;
  container.appendChild(userMsg);

  // Bot message
  const botMsg = document.createElement("div");
  botMsg.className = "bot-msg";
  botMsg.innerHTML = botText || "🤲 Generating response...";
  container.appendChild(botMsg);

  chatBox.appendChild(container);
  chatBox.scrollTop = chatBox.scrollHeight;

  return botMsg;
}

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

    // Format the response for readability
    let formatted = data.response
      .replace(/\n/g, "<br>")                         // Line breaks
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
      .replace(/\*(.*?)\*/g, "<em>$1</em>")             // Italic
      .replace(/\#\#\s(.*?)(<br>|$)/g, "<h3>$1</h3>")   // Subheadings
      .replace(/\|(.+?)\|/g, (match) => {               // Convert tables to HTML
        const rows = match.trim().split("\n").filter(r => r.trim());
        const tableRows = rows.map(row => {
          const cols = row.split("|").map(c => c.trim());
          return "<tr>" + cols.map(c => `<td>${c}</td>`).join("") + "</tr>";
        }).join("");
        return `<table class="chat-table">${tableRows}</table>`;
      });

    botMsgElem.innerHTML = `🤖: ${formatted}`;
  } catch (err) {
    botMsgElem.innerHTML = "🤖: Error connecting to backend.";
  }
}

// Send on ENTER, allow SHIFT+ENTER for new line
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
