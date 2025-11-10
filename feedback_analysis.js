const FEEDBACK_DATA_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/get-feedback";

async function loadFeedback() {
  const res = await fetch(FEEDBACK_DATA_URL);
  const data = await res.json();

  document.getElementById("total-count").textContent = data.length;

  // Calculate average satisfaction score (Q8)
  let scores = data.map(f => parseFloat(f.q8)).filter(n => !isNaN(n));
  let avg = scores.length ? (scores.reduce((a,b)=>a+b,0) / scores.length).toFixed(2) : "No data";
  document.getElementById("avg-score").textContent = avg;

  // Extract common keywords from comments
  let text = data.map(f => f.comments || "").join(" ").toLowerCase();
  let words = text.split(/\s+/).filter(w => w.length > 4);
  let freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  let sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,7);
  document.getElementById("keywords").textContent = sorted.map(w=>w[0]).join(", ") || "No data";

  // Fill table
  const tbody = document.querySelector("#feedback-table tbody");
  tbody.innerHTML = "";
  data.forEach(f => {
    let row = `
      <tr>
        <td>${f.name || "-"}</td>
        <td>${f.student_id || "-"}</td>
        <td>${f.program || "-"}</td>
        <td>${f.q8 || "-"}</td>
        <td>${sorted[0] ? sorted[0][0] : "-"}</td>
        <td>${f.comments || "-"}</td>
      </tr>`;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}

loadFeedback();
