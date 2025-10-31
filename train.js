const TRAIN_API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/train";
const form = document.getElementById("train-form");
const responseText = document.getElementById("train-response");
const preview = document.getElementById("train-preview");

function formatAnswer(text) {
  return text
    .replace(/\r\n|\r/g, "\n")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\#\#\s(.*?)(\n|$)/g, "<h3>$1</h3>")
    .replace(/\|(.+?)\|/gs, (match) => {
      const rows = match.trim().split("\n").filter(r => r.trim());
      const tableRows = rows.map(row => {
        const cols = row.split("|").map(c => c.trim()).filter(c => c);
        return "<tr>" + cols.map(c => `<td>${c}</td>`).join("") + "</tr>";
      }).join("");
      return `<table class="chat-table">${tableRows}</table>`;
    })
    .replace(/\n/g, "<br>");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = document.getElementById("question").value.trim();
  const answer = document.getElementById("answer").value.trim();

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

    document.getElementById("question").value = "";
    document.getElementById("answer").value = "";

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

    // Update chat in-memory answers
    if (window.chatAddTrainedAnswer) {
      window.chatAddTrainedAnswer(question, answer);
    }

  } catch (err) {
    console.error(err);
    responseText.textContent = "Error submitting training data.";
  }
});
