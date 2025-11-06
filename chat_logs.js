const API = "https://identifyingspiritualsickness-chatbot.onrender.com";
const ADMIN_KEY = "mc250132689";

async function loadLogs() {
  try {
    const res = await fetch(`${API}/chat-logs?key=${ADMIN_KEY}`);
    const data = await res.json();
    const box = document.getElementById("logContainer");
    box.innerHTML = "";

    data.logs.forEach(l => {
      const el = document.createElement("div");
      el.className = "log-entry";
      el.innerHTML = `
        <b>User:</b> ${escapeHtml(l.user)}<br>
        <b>Bot:</b> ${escapeHtml(l.bot)}
        <small>${new Date(l.time).toLocaleString()}</small>
      `;
      box.appendChild(el);
    });
  } catch (err) {
    console.warn("Could not load chat logs", err);
    document.getElementById("logContainer").innerText = "Unable to load logs.";
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return text.replace(/[&<>"'`=\/]/g, s => {
    return ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
      "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
    })[s];
  });
}

document.getElementById("searchInput").addEventListener("input", e => {
  const filter = e.target.value.toLowerCase();
  document.querySelectorAll(".log-entry").forEach(entry => {
    entry.style.display = entry.innerText.toLowerCase().includes(filter) ? "" : "none";
  });
});

loadLogs();
