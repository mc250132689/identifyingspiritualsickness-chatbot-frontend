const TRAIN_API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/train";
const form = document.getElementById("train-form");
const responseText = document.getElementById("train-response");
const preview = document.getElementById("train-preview");

function formatAnswer(text) {
  if (!text) return "";
  return text
    .replace(/\r\n|\r|\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
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
    responseText.textContent = data.message || "Training data submitted!";

    document.getElementById("question").value = "";
    document.getElementById("answer").value = "";

    const userBubble = document.createElement("div");
    userBubble.className = "train-user-msg";
    userBubble.textContent = question;

    const botBubble = document.createElement("div");
    botBubble.className = "train-bot-msg";
    botBubble.innerHTML = formatAnswer(answer);

    const pair = document.createElement("div");
    pair.className = "train-msg-pair";
    pair.appendChild(userBubble);
    pair.appendChild(botBubble);

    preview.appendChild(pair);
    preview.scrollTop = preview.scrollHeight;

    if (window.chatAddTrainedAnswer) {
      window.chatAddTrainedAnswer(question, answer);
    }

  } catch (err) {
    console.error(err);
    responseText.textContent = "Error submitting training data.";
  }
});
