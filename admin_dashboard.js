let trainingData = [];
const tableBody = document.querySelector("#training-table tbody");

// WebSocket for live updates
const ws = new WebSocket("ws://127.0.0.1:8000/ws/admin");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "chat" || data.type === "update") {
    loadTrainingData(); // refresh table when new chat or training occurs
  }
  if (data.type === "delete") {
    loadTrainingData();
  }
};

// Load data from backend
async function loadTrainingData() {
  const res = await fetch("http://127.0.0.1:8000/get-training-data");
  const data = await res.json();
  trainingData = data.training_data;
  renderTable(trainingData);
  renderCharts(trainingData);
}

// Render table
function renderTable(data) {
  tableBody.innerHTML = "";
  data.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.lang}</td><td>${item.question}</td><td>${item.answer}</td>`;
    tableBody.appendChild(row);
  });
}

// Filter table
function filterTable() {
  const keyword = document.getElementById("keyword").value.toLowerCase();
  const lang = document.getElementById("lang-filter").value;
  const filtered = trainingData.filter(item =>
    (!lang || item.lang === lang) &&
    (item.question.toLowerCase().includes(keyword) || item.answer.toLowerCase().includes(keyword))
  );
  renderTable(filtered);
  renderCharts(filtered);
}

// Add new training data
document.getElementById("trainForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const lang = document.getElementById("new-lang").value;
  const question = document.getElementById("new-question").value;
  const answer = document.getElementById("new-answer").value;

  const res = await fetch("http://127.0.0.1:8000/train", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lang, question, answer })
  });
  const result = await res.json();
  document.getElementById("trainMessage").innerText = result.message;
  e.target.reset();
});

// Charts
function renderCharts(data) {
  const langCtx = document.getElementById("langChart").getContext("2d");
  const lenCtx = document.getElementById("lengthChart").getContext("2d");
  const freqCtx = document.getElementById("freqChart").getContext("2d");

  const langCount = {};
  const qLen = [], aLen = [];
  const freqMap = {};

  data.forEach(item => {
    langCount[item.lang] = (langCount[item.lang] || 0) + 1;
    qLen.push(item.question.length);
    aLen.push(item.answer.length);
    freqMap[item.question] = (freqMap[item.question] || 0) + 1;
  });

  new Chart(langCtx, {
    type: 'pie',
    data: { labels: Object.keys(langCount), datasets: [{ data: Object.values(langCount), backgroundColor: ['#1abc9c','#16a085','#27ae60'] }] },
    options: { responsive: true, plugins: { title: { display: true, text: 'Language Distribution' } } }
  });

  new Chart(lenCtx, {
    type: 'bar',
    data: { labels: data.map((_, i) => i+1), datasets: [{ label: 'Q length', data: qLen, backgroundColor: '#1abc9c' }, { label: 'A length', data: aLen, backgroundColor: '#16a085' }] },
    options: { responsive: true, scales: { y: { beginAtZero: true } }, plugins: { title: { display: true, text: 'Q/A Length Distribution' } } }
  });

  new Chart(freqCtx, {
    type: 'bar',
    data: { labels: Object.keys(freqMap), datasets: [{ label: 'Frequency', data: Object.values(freqMap), backgroundColor: '#27ae60' }] },
    options: { responsive: true, plugins: { title: { display: true, text: 'Question Frequency' } }, scales: { y: { beginAtZero: true } } }
  });
}

// Export & Import
function exportData() {
  const dataStr = JSON.stringify(trainingData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "training_data.json";
  a.click();
}

function importData() {
  const file = document.getElementById("import-file").files[0];
  if (!file) return alert("Select a file first!");
  const reader = new FileReader();
  reader.onload = async function(e) {
    let importedData;
    try { importedData = JSON.parse(e.target.result); }
    catch { return alert("Invalid JSON file!"); }
    const res = await fetch("http://127.0.0.1:8000/train", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(importedData)
    });
    const result = await res.json();
    alert(result.message);
    loadTrainingData();
  }
  reader.readAsText(file);
}

// Tabs
function openTab(evt, tabName) {
  const tabcontent = document.querySelectorAll(".tabcontent");
  tabcontent.forEach(tc => tc.style.display = "none");

  const tablinks = document.querySelectorAll(".tablink");
  tablinks.forEach(tl => tl.classList.remove("active"));

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.classList.add("active");
}

// Initial load
loadTrainingData();
