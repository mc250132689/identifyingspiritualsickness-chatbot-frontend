const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send-btn");

sendBtn.addEventListener("click", async () => {
    const msg = messageInput.value.trim();
    if (!msg) return;
    chatBox.innerHTML += `<div><b>You:</b> ${msg}</div>`;
    messageInput.value = "";
    const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    chatBox.innerHTML += `<div><b>Bot:</b> ${data.response}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
});
