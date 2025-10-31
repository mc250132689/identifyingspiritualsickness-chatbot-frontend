const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

function addMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = sender === "user" ? "text-right" : "text-left";

  const bubble = document.createElement("div");
  bubble.className =
    sender === "user"
      ? "inline-block bg-emerald-200 text-emerald-900 p-3 rounded-xl mb-2 max-w-[80%]"
      : "inline-block bg-white shadow p-3 rounded-xl mb-2 max-w-[85%] ai-message";

  // Convert markdown-like formatting into paragraphs for easier reading
  const formatted = text
    .split(/\n{2,}/)
    .map(p => `<p>${p}</p>`)
    .join("");
  bubble.innerHTML = formatted;
  msgDiv.appendChild(bubble);
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  addMessage("user", "🧍: " + message);
  userInput.value = "";

  addMessage("bot", "🤖 Sedang berfikir...");

  const res = await fetch("https://identifyingspiritualsickness-chatbot.onrender.com/chat", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  chatBox.lastChild.remove();
  addMessage("bot", "🤖: " + data.reply);
});
