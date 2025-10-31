const trainBtn = document.getElementById("train-btn");
const statusMsg = document.getElementById("train-status");

trainBtn.addEventListener("click", async () => {
  const question = document.getElementById("question").value.trim();
  const answer = document.getElementById("answer").value.trim();
  const lang = document.getElementById("lang").value;

  if (!question || !answer) {
    statusMsg.innerText = "⚠️ Please fill all fields!";
    return;
  }

  statusMsg.innerText = "⏳ Submitting...";

  try {
    const res = await fetch("https://identifyingspiritualsickness-chatbot.onrender.com/train", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, lang }),
    });

    const data = await res.json();
    statusMsg.innerText = `✅ ${data.message}`;

    // Auto clear inputs
    document.getElementById("question").value = "";
    document.getElementById("answer").value = "";
  } catch (err) {
    statusMsg.innerText = "⚠️ Error connecting to backend!";
  }
});
