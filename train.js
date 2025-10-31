const trainBtn = document.getElementById("train-btn");
const trainStatus = document.getElementById("train-status");

trainBtn.addEventListener("click", async () => {
  const question = document.getElementById("train-question").value.trim();
  const answer = document.getElementById("train-answer").value.trim();

  if (!question || !answer) {
    trainStatus.textContent = "⚠️ Please fill in both fields.";
    return;
  }

  trainStatus.textContent = "⏳ Submitting...";
  try {
    await fetch("https://identifyingspiritualsickness-chatbot.onrender.com/train", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    trainStatus.textContent = "✅ Training data submitted!";
  } catch {
    trainStatus.textContent = "❌ Failed to submit data.";
  }
});
