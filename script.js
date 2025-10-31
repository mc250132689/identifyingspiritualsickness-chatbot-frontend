// =============================
// 🕋 Spiritual Sickness Chatbot
// =============================

// --------- CHAT PAGE ---------
const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

// Your backend API URL (change this to your Render backend link)
const API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com"; // <-- replace with your deployed backend

// Function to add messages to chatbox
function addMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = sender === "user" ? "text-right" : "text-left";

  const bubble = document.createElement("div");
  bubble.className =
    sender === "user"
      ? "inline-block bg-emerald-200 text-emerald-900 p-3 rounded-xl mb-2 max-w-[80%]"
      : "inline-block bg-white shadow p-3 rounded-xl mb-2 max-w-[85%] ai-message";

  // Format the message into readable paragraphs
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold markdown
    .replace(/\n{2,}/g, "</p><p>") // separate paragraphs
    .replace(/\n/g, "<br>"); // line breaks
  bubble.innerHTML = `<p>${formatted}</p>`;
  msgDiv.appendChild(bubble);

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle chat message submission
if (chatForm) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    // Show user message
    addMessage("user", "🧍: " + message);
    userInput.value = "";

    // Temporary "thinking" message
    addMessage("bot", "🤖 Sedang berfikir...");

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error("Response error");
      const data = await res.json();

      // Remove the "thinking..." bubble
      chatBox.lastChild.remove();

      // Show the AI’s reply (always in domain of ruqyah & spiritual healing)
      addMessage("bot", "🤖: " + data.reply);
    } catch (err) {
      console.error(err);
      chatBox.lastChild.remove();
      addMessage(
        "bot",
        "⚠️ Maaf, berlaku ralat sambungan ke pelayan. Sila cuba lagi sebentar."
      );
    }
  });
}

// --------- TRAIN PAGE ---------
const trainForm = document.getElementById("train-form");
if (trainForm) {
  trainForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = document.getElementById("train-question").value.trim();
    const answer = document.getElementById("train-answer").value.trim();
    if (!question || !answer) {
      alert("⚠️ Sila isi kedua-dua medan!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/train`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });

      if (res.ok) {
        alert("✅ Latihan berjaya disimpan!");
        trainForm.reset();
      } else {
        alert("⚠️ Ralat semasa menyimpan latihan.");
      }
    } catch (err) {
      alert("⚠️ Gagal menyambung ke pelayan. Sila cuba lagi.");
    }
  });
}
