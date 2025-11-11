const TRAIN_API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/train";
const form = document.getElementById("train-form");
const responseText = document.getElementById("train-response");
const preview = document.getElementById("train-preview");

const answerTextarea = document.getElementById("answer");

// Function to dynamically resize textarea
function resizeTextarea() {
  answerTextarea.style.height = 'auto'; // reset height
  answerTextarea.style.height = answerTextarea.scrollHeight + 'px'; // grow/shrink
}

// Listen for input events
answerTextarea.addEventListener('input', resizeTextarea);

function formatAnswer(text) {
  if (!text) return "";
  let formatted = text
    .replace(/\r\n|\r|\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\#\#\s(.*?)(\n|$)/g, "<h3>$1</h3>")
    .replace(/\|(.+?)\|/gs, (match) => {
      const rows = match.trim().split("<br>").filter(r => r.trim());
      const tableRows = rows.map(row => {
        const cols = row.split("|").map(c => c.trim()).filter(c => c !== "");
        return "<tr>" + cols.map(c => `<td>${c}</td>`).join("") + "</tr>";
      }).join("");
      return `<table class="chat-table">${tableRows}</table>`;
    });
  return formatted;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = document.getElementById("question").value.trim();
  const answer = answerTextarea.value.trim();

  if (!question || !answer) {
    responseText.textContent = "Please fill both fields.";
    return;
  }

  responseText.textContent = "Submitting...";

  try {
    const res = await fetch(TRAIN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });

    const data = await res.json();
    responseText.innerHTML = data.message || "Training data submitted successfully!";

    // Auto-clear input fields
    document.getElementById("question").value = "";
    answerTextarea.value = "";
    resizeTextarea(); // reset textarea height

    // Show preview
    const formattedAnswer = formatAnswer(answer);
    const userBubble = document.createElement("div");
    userBubble.className = "train-user-msg";
    userBubble.textContent = question;

    const botBubble = document.createElement("div");
    botBubble.className = "train-bot-msg";
    botBubble.innerHTML = formattedAnswer;

    const pair = document.createElement("div");
    pair.className = "train-msg-pair";
    pair.appendChild(userBubble);
    pair.appendChild(botBubble);

    preview.appendChild(pair);
    preview.scrollTop = preview.scrollHeight;

    // Update local trained answers cache
    try {
      const cached = JSON.parse(localStorage.getItem('trained_answers_cache') || '[]');
      cached.push({ question, answer, lang: 'en' });
      localStorage.setItem('trained_answers_cache', JSON.stringify(cached));
      if (window.chatAddTrainedAnswer) {
        window.chatAddTrainedAnswer(question, answer);
      }
    } catch (e) {
      console.warn(e);
    }

  } catch (err) {
    console.error(err);
    responseText.textContent = "Error submitting training data.";
  }
});
