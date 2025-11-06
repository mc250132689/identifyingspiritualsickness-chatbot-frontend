const API = "https://identifyingspiritualsickness-chatbot.onrender.com";

async function loadFeedback() {
  const res = await fetch(`${API}/feedback`);
  const data = await res.json();
  const box = document.getElementById("feedbackContainer");
  box.innerHTML = "";

  data.feedback.forEach(f => {
    box.innerHTML += `
      <div class="feedback-entry">
        <p>${f.text}</p>
        <small>${f.time}</small>
      </div>
    `;
  });
}

document.getElementById("searchInput").addEventListener("input", e => {
  const filter = e.target.value.toLowerCase();
  document.querySelectorAll(".feedback-entry").forEach(entry => {
    entry.style.display = entry.innerText.toLowerCase().includes(filter) ? "" : "none";
  });
});

loadFeedback();
