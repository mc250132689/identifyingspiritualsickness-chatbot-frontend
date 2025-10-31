const TRAIN_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/train";

async function trainChatbot() {
  const q = document.getElementById("train-question").value.trim();
  const a = document.getElementById("train-answer").value.trim();
  const statusDiv = document.getElementById("train-status");

  if (!q || !a) {
    statusDiv.innerHTML = "⚠️ Please fill both question and answer.";
    return;
  }

  try {
    const res = await fetch(TRAIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, answer: a }),
    });

    const data = await res.json();
    statusDiv.innerHTML = `✅ ${data.message}`;
    document.getElementById("train-question").value = "";
    document.getElementById("train-answer").value = "";
  } catch (err) {
    statusDiv.innerHTML = `❌ Error: ${err.message}`;
  }
}
