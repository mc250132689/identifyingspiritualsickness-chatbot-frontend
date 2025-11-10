const GUIDANCE_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/guidance";
const runBtn = document.getElementById("run-btn");
const symptomsEl = document.getElementById("symptoms");
const resultEl = document.getElementById("result");

function renderResult(data) {
  if (!data) return;
  let html = `<div class="card-compact"><h3>Severity: ${data.severity}</h3>`;
  html += `<p><strong>Matched Jin:</strong> ${data.matched_jin}</p>`;
  html += `<p><strong>Matched Sihr:</strong> ${data.matched_sihir}</p>`;
  html += `<p><strong>Matched Ruqyah:</strong> ${data.matched_ruqyah}</p>`;
  if (data.suggestions && data.suggestions.length) {
    html += `<h4>Suggestions</h4><ul>`;
    data.suggestions.forEach(s => html += `<li>${s}</li>`);
    html += `</ul>`;
  }
  if (data.recommended_steps) {
    html += `<h4>Recommended Steps</h4><ol>`;
    data.recommended_steps.forEach(s => html += `<li>${s}</li>`);
    html += `</ol>`;
  }
  html += `</div>`;
  resultEl.innerHTML = html;
}

runBtn.addEventListener("click", async () => {
  const symptoms = symptomsEl.value.trim();
  if (!symptoms) {
    alert("Please describe the symptoms.");
    return;
  }
  resultEl.innerHTML = "⏳ Evaluating...";
  try {
    const res = await fetch(GUIDANCE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms }),
    });
    const data = await res.json();
    renderResult(data);
  } catch (err) {
    console.error(err);
    resultEl.innerHTML = "⚠️ Error contacting server.";
  }
});
