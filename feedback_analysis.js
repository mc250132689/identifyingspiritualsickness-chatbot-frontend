const FEEDBACK_DATA_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/get-feedback";

// Keep track of existing feedback IDs to detect new entries
let existingIds = new Set();

async function loadFeedback() {
  try {
    const res = await fetch(FEEDBACK_DATA_URL);
    const data = await res.json();

    // Update total count
    document.getElementById("total-count").textContent = data.length;

    // Calculate average satisfaction score (Q8)
    let scores = data.map(f => parseFloat(f.q8)).filter(n => !isNaN(n));
    let avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : "No data";
    document.getElementById("avg-score").textContent = avg;

    // Extract common keywords from comments
    let text = data.map(f => f.comments || "").join(" ").toLowerCase();
    let words = text.split(/\s+/).filter(w => w.length > 4);
    let freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    let sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 7);
    document.getElementById("keywords").textContent = sorted.map(w => w[0]).join(", ") || "No data";

    // Fill table
    const tbody = document.querySelector("#feedback-table tbody");
    tbody.innerHTML = "";

    data.forEach(f => {
      let isNew = !existingIds.has(f.id); // detect new entry (assumes each feedback has unique `id`)
      existingIds.add(f.id);

      let row = document.createElement("tr");
      if (isNew) {
        row.classList.add("new-feedback"); // Add highlight class
      }

      row.innerHTML = `
        <td>${f.name || "-"}</td>
        <td>${f.student_id || "-"}</td>
        <td>${f.program || "-"}</td>
        <td>${f.q8 || "-"}</td>
        <td>${sorted[0] ? sorted[0][0] : "-"}</td>
        <td>${f.comments || "-"}</td>
      `;
      tbody.appendChild(row);

      // Animate new feedback highlight
      if (isNew) {
        setTimeout(() => row.classList.remove("new-feedback"), 2000); // Highlight lasts 2 seconds
      }
    });

  } catch (err) {
    console.error("Error loading feedback:", err);
  }
}

// Initial load
loadFeedback();

// Auto-refresh every 5 seconds
setInterval(loadFeedback, 5000);
