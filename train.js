const trainBtn = document.getElementById("train-btn");
const trainStatus = document.getElementById("train-status");
const questionField = document.getElementById("train-question");
const answerField = document.getElementById("train-answer");

trainBtn.addEventListener("click", async () => {
  const question = questionField.value.trim();
  const answer = answerField.value.trim();

  if (!question || !answer) {
    trainStatus.textContent = "⚠️ Please fill in both fields.";
    trainStatus.style.color = "red";
    return;
  }

  trainStatus.textContent = "⏳ Submitting...";
  trainStatus.style.color = "#333";

  try {
    const response = await fetch("https://identifyingspiritualsickness-chatbot.onrender.com/train", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });

    if (response.ok) {
      trainStatus.textContent = "✅ Training data submitted successfully!";
      trainStatus.style.color = "green";

      // 🧹 Auto-clear input fields after 2 seconds
      setTimeout(() => {
        questionField.value = "";
        answerField.value = "";
        trainStatus.textContent = "";
      }, 2000);
    } else {
      throw new Error("Server error");
    }
  } catch (err) {
    trainStatus.textContent = "❌ Failed to submit data. Try again later.";
    trainStatus.style.color = "red";
  }
});
