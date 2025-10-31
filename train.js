const TRAIN_API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/train";
const form = document.getElementById("train-form");
const responseText = document.getElementById("train-response");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = document.getElementById("question").value.trim();
  let answer = document.getElementById("answer").value.trim();

  if (!question || !answer) {
    responseText.textContent = "Please fill both fields.";
    return;
  }

  // Format answer for chat usage
  answer = answer
    .replace(/\r\n|\r/g, "\n")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\#\#\s(.*?)(\n|$)/g, "<h3>$1</h3>");

  responseText.textContent = "Submitting...";

  try {
    const res = await fetch(TRAIN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });

    const data = await res.json();
    responseText.innerHTML = data.message || "Training data submitted successfully!";

    // Clear inputs
    document.getElementById("question").value = "";
    document.getElementById("answer").value = "";
  } catch (err) {
    responseText.textContent = "Error submitting training data.";
  }
});
