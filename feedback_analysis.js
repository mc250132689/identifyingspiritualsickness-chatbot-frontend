const FEEDBACK_DATA_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/get-feedback";

async function loadFeedback() {
  try {
    const res = await fetch(FEEDBACK_DATA_URL);
    const data = await res.json();

    document.getElementById("total-count").textContent = data.length;

    // Keyword extraction
    let text = data.map(f => (f.comments || "").toLowerCase()).join(" ");
    let words = text.split(/\s+/).filter(w => w.length > 4);
    let freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    let sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 7);
    document.getElementById("keywords").textContent = sorted.map(w => w[0]).join(", ") || "-";

    // Fill table
    const tbody = document.querySelector("#feedback-table tbody");
    tbody.innerHTML = "";

    data.forEach(f => {
      let row = document.createElement("tr");
      row.innerHTML = `
        <td>${f.name || "-"}</td>
        <td>${f.student_id || "-"}</td>
        <td>${f.program || "-"}</td>
        <td>${f.q8 || "-"}</td>
        <td>${sorted[0] ? sorted[0][0] : "-"}</td>
        <td>${f.comments || "-"}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading feedback:", err);
  }
}

loadFeedback();
setInterval(loadFeedback, 5000);
