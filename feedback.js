const API = "https://identifyingspiritualsickness-chatbot.onrender.com";
const ADMIN_KEY = "mc250132689";

async function loadFeedback() {
  try {
    const res = await fetch(`${API}/feedback?key=${ADMIN_KEY}`);
    const data = await res.json();
    const box = document.getElementById("feedbackContainer");
    box.innerHTML = "";

    data.feedback.forEach(f => {
      const el = document.createElement("div");
      el.className = "feedback-entry";
      el.innerHTML = `<p>${escapeHtml(f.text)}</p><small>${new Date(f.time).toLocaleString()}</small>`;
      box.appendChild(el);
    });
  } catch (err) {
    console.warn("Could not load feedback", err);
    document.getElementById("feedbackContainer").innerText = "Unable to load feedback.";
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
  document.querySelectorAll(".feedback-entry").forEach(entry => {
    entry.style.display = entry.innerText.toLowerCase().includes(filter) ? "" : "none";
  });
});

loadFeedback();
