const API = "https://identifyingspiritualsickness-chatbot.onrender.com";

async function loadLogs() {
  const res = await fetch(`${API}/chat-logs`);
  const data = await res.json();
  const box = document.getElementById("logContainer");
  box.innerHTML = "";

  data.logs.forEach(l => {
    box.innerHTML += `
      <div class="log-entry">
        <b>User:</b> ${l.user}<br>
        <b>Bot:</b> ${l.bot}
        <small>${l.time}</small>
      </div>
    `;
  });
}

document.getElementById("searchInput").addEventListener("input", e => {
  const filter = e.target.value.toLowerCase();
  document.querySelectorAll(".log-entry").forEach(entry => {
    entry.style.display = entry.innerText.toLowerCase().includes(filter) ? "" : "none";
  });
});

loadLogs();
