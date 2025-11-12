const CHAT_API = "https://identifyingspiritualsickness-chatbot.onrender.com/guidance";
const chatForm = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");

chatForm.addEventListener("submit", async e => {
  e.preventDefault();
  const questionInput = document.getElementById("user-question");
  const question = questionInput.value.trim();
  if(!question) return;

  // Show user message
  const userMsg = document.createElement("div");
  userMsg.className = "user-msg"; userMsg.textContent = question;
  chatBox.appendChild(userMsg); chatBox.scrollTop = chatBox.scrollHeight;
  questionInput.value="";

  try {
    const res = await fetch(`${CHAT_API}?question=${encodeURIComponent(question)}`);
    const data = await res.json();
    const botMsg = document.createElement("div");
    botMsg.className = "bot-msg"; botMsg.textContent = data.response||"No response.";
    chatBox.appendChild(botMsg); chatBox.scrollTop = chatBox.scrollHeight;
  } catch(err){ console.error(err); }
});
