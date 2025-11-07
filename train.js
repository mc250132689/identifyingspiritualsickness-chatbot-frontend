const qInput = document.getElementById("question");
const aInput = document.getElementById("answer");
const langSelect = document.getElementById("lang");
const tableBody = document.querySelector("#training-table tbody");

async function loadTraining() {
  const res = await fetch("http://127.0.0.1:8000/get-training-data");
  const data = await res.json();
  tableBody.innerHTML = "";
  data.training_data.forEach((item, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.lang}</td>
      <td>${item.question}</td>
      <td>${item.answer}</td>
      <td><button onclick="deleteEntry('${item.question}', '${item.lang}')">Delete</button></td>
    `;
    tableBody.appendChild(row);
  });
}

async function train() {
  const question = qInput.value.trim();
  const answer = aInput.value.trim();
  const lang = langSelect.value;
  if (!question || !answer) return alert("Please fill both fields");
  const res = await fetch("http://127.0.0.1:8000/train", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, answer, lang }),
  });
  const data = await res.json();
  alert(data.message);
  qInput.value = aInput.value = "";
  loadTraining();
}

async function deleteEntry(question, lang) {
  if (!confirm("Delete this entry?")) return;
  await fetch(`http://127.0.0.1:8000/train?question=${encodeURIComponent(question)}&lang=${lang}`, { method: "DELETE" });
  loadTraining();
}

loadTraining();
