const ADMIN_KEY = "mc250132689"; // change if needed
const API = "https://identifyingspiritualsickness-chatbot.onrender.com";

let trainingData = [];
let currentPage = 1;
const rowsPerPage = 10;
let originalQuestion = "";

// Load data
async function loadData() {
  const res = await fetch(`${API}/get-training-data`);
  const data = await res.json();
  trainingData = data.training_data;
  displayPage();
}

// Display paginated table
function displayPage() {
  const table = document.getElementById("dataTable");
  table.innerHTML = "";

  let start = (currentPage - 1) * rowsPerPage;
  let end = start + rowsPerPage;
  let pageItems = trainingData.slice(start, end);

  pageItems.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.question}</td>
      <td>${item.answer}</td>
      <td>${item.lang}</td>
      <td>
        <button class="edit-btn" onclick="openEdit('${item.question}', '${item.answer}', '${item.lang}')">Edit</button>
        <button class="delete-btn" onclick="deleteEntry('${item.question}')">Delete</button>
      </td>
    `;
    table.appendChild(tr);
  });

  document.getElementById("pageInfo").textContent =
    `Page ${currentPage} of ${Math.ceil(trainingData.length / rowsPerPage)}`;
}

function nextPage() { if (currentPage * rowsPerPage < trainingData.length) { currentPage++; displayPage(); } }
function prevPage() { if (currentPage > 1) { currentPage--; displayPage(); } }

// Search
document.getElementById("searchInput").addEventListener("keyup", function () {
  const filter = this.value.toLowerCase();
  trainingData = trainingData.filter(item => 
    item.question.toLowerCase().includes(filter) || 
    item.answer.toLowerCase().includes(filter)
  );
  currentPage = 1;
  displayPage();
});

// Delete Entry
async function deleteEntry(question) {
  if (!confirm("Delete this entry?")) return;
  await fetch(`${API}/delete-entry?question=${encodeURIComponent(question)}&key=${ADMIN_KEY}`, { method: "DELETE" });
  loadData();
}

// Edit Entry Modal
function openEdit(question, answer, lang) {
  originalQuestion = question;
  document.getElementById("editQuestion").value = question;
  document.getElementById("editAnswer").value = answer;
  document.getElementById("editLang").value = lang;
  document.getElementById("editModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

// Save Edited Entry
async function saveEdit() {
  const newQ = document.getElementById("editQuestion").value.trim();
  const newA = document.getElementById("editAnswer").value.trim();
  const newL = document.getElementById("editLang").value.trim();

  await fetch(`${API}/update-entry?question=${encodeURIComponent(originalQuestion)}&new_question=${encodeURIComponent(newQ)}&new_answer=${encodeURIComponent(newA)}&new_lang=${encodeURIComponent(newL)}&key=${ADMIN_KEY}`, {
    method: "PUT"
  });

  closeModal();
  loadData();
}

// CSV Download
function downloadCSV() {
  let rows = [["Question", "Answer", "Language"]];
  trainingData.forEach(item => rows.push([item.question, item.answer, item.lang]));

  let csv = rows.map(r => r.join(",")).join("\n");
  let blob = new Blob([csv], { type: "text/csv" });

  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "training_data.csv";
  link.click();
}

loadData();
