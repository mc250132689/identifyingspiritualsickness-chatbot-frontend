const BASE_URL = "https://identifyingspiritualsickness-chatbot.onrender.com";
const loginBtn = document.getElementById("login-btn");
const loginSection = document.getElementById("login-section");
const dashboard = document.getElementById("dashboard");
const statusText = document.getElementById("login-status");

let trainingData = [];
let chatData = [];

loginBtn.addEventListener("click", async () => {
  const key = document.getElementById("admin-key").value.trim();
  if (!key) return alert("Please enter admin key");
  statusText.textContent = "⏳ Connecting to server...";

  try {
    const res = await fetch(`${BASE_URL}/admin-stats?key=${encodeURIComponent(key)}`);
    if (!res.ok) throw new Error("Backend unreachable");
    const data = await res.json();
    if (data.error) { statusText.textContent = "❌ Unauthorized Admin Key!"; return; }

    loginSection.style.display = "none";
    dashboard.style.display = "block";

    document.getElementById("total-records").textContent = data.total_records;
    document.getElementById("avg-q-len").textContent = data.avg_question_length;
    document.getElementById("avg-a-len").textContent = data.avg_answer_length;

    await loadTrainingData();
    await loadChatData();
  } catch (err) {
    statusText.textContent = "⚠️ Error: Server offline or sleeping.";
    console.log(err);
  }
});

async function loadTrainingData() {
  try {
    const res = await fetch(`${BASE_URL}/get-training-data`);
    const data = await res.json();
    trainingData = data.training_data;
    populateTable('training-table', trainingData, ['question','answer','language']);
    renderCharts();
  } catch(err) { console.error(err); }
}

async function loadChatData() {
  try {
    const res = await fetch(`${BASE_URL}/get-chat-logs?key=ADMIN_KEY`);
    const data = await res.json();
    chatData = data.logs || [];
    document.getElementById("total-chats").textContent = chatData.length;
    populateTable('chat-table', chatData, ['user','message','timestamp']);
  } catch(err) { console.log("Chat logs not available:", err); }
}

function populateTable(tableId, data, keys) {
  const tbody = document.getElementById(tableId).querySelector('tbody');
  tbody.innerHTML = '';
  data.forEach(row => {
    const tr = document.createElement('tr');
    keys.forEach(k => {
      const td = document.createElement('td');
      td.textContent = row[k] || '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function renderCharts() {
  const symptomCounts = {};
  trainingData.forEach(d => {
    const question = d.question.toLowerCase();
    if (question.includes("nightmares")) symptomCounts["Nightmares"] = (symptomCounts["Nightmares"]||0)+1;
    if (question.includes("jinn")) symptomCounts["Jinn"] = (symptomCounts["Jinn"]||0)+1;
    if (question.includes("sihr")) symptomCounts["Sihr/Black Magic"] = (symptomCounts["Sihr/Black Magic"]||0)+1;
    if (question.includes("ruqyah")) symptomCounts["Ruqyah"] = (symptomCounts["Ruqyah"]||0)+1;
  });

  new Chart(document.getElementById("symptomChart"), {
    type: 'bar',
    data: { labels: Object.keys(symptomCounts), datasets: [{ label: 'Occurrences', data: Object.values(symptomCounts), backgroundColor: '#007bff' }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  const langCounts = {};
  trainingData.forEach(d => { langCounts[d.language] = (langCounts[d.language]||0)+1; });
  new Chart(document.getElementById("langChart"), {
    type: 'pie',
    data: { labels: Object.keys(langCounts), datasets: [{ data: Object.values(langCounts), backgroundColor: ['#007bff','#28a745','#ffc107','#6f42c1','#17a2b8'] }] },
    options: { responsive: true }
  });
}

// CSV Export
function downloadCSV(data, filename) {
  if (!data || !data.length) return alert("No data to download.");
  const keys = Object.keys(data[0]);
  const csvRows = [keys.join(",")];
  data.forEach(row => { csvRows.push(keys.map(k => `"${row[k]}"`).join(",")); });
  const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// PDF Export
function downloadPDF(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return alert("Table not found!");
  const opt = { margin: 0.5, filename, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' } };
  html2pdf().set(opt).from(table).save();
}
