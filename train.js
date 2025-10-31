const TRAIN_API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/train";

const form = document.getElementById("train-form");
const responseText = document.getElementById("train-response");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = document.getElementById("question").value.trim();
  const answer = document.getElementById("answer").value.trim();

  if (!question || !answer) {
    responseText.textContent = "Please fill both fields.";
    return;
  }

  responseText.textContent = "Submitting...";
  const res = await fetch(TRAIN_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, answer }),
  });

  const data = await res.json();
  responseText.textContent = data.message;

  // Clear input after submit
  document.getElementById("question").value = "";
  document.getElementById("answer").value = "";
});
