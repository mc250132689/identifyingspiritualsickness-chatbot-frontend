const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

async function addMessage(userMsg, botMsg) {
    const userDiv = document.createElement("div");
    userDiv.className = "chat-message user-msg";
    userDiv.textContent = userMsg;
    chatWindow.appendChild(userDiv);

    const botDiv = document.createElement("div");
    botDiv.className = "chat-message bot-msg";
    botDiv.textContent = botMsg;
    chatWindow.appendChild(botDiv);

    chatWindow.scrollTop = chatWindow.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    chatInput.value = "";
    const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    });

    const data = await response.json();
    addMessage(message, data.response);
});
