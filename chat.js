const API = "https://identifyingspiritualsickness-chatbot.onrender.com";

async function sendMessage() {
  const input = document.getElementById("user-input");
  const msg = input.value.trim();
  if (!msg) return;

  addMessage("You: " + msg);
  input.value = "";

  const r = await fetch(API + "/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg })
  });

  const data = await r.json();
  addMessage("Bot: " + data.reply);
}

function addMessage(text) {
  const box = document.getElementById("chat-box");
  box.innerHTML += `<div>${text}</div>`;
  box.scrollTop = box.scrollHeight;
}

function toggleFeedback() {
  const f = document.getElementById("feedback-form");
  f.style.display = f.style.display === "none" ? "block" : "none";
}

async function sendFeedback(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const feedback = Object.fromEntries(formData.entries());

  await fetch(API + "/feedback", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(feedback)
  });

  alert("Thank you for your feedback.");
  e.target.reset();
  toggleFeedback();
}
