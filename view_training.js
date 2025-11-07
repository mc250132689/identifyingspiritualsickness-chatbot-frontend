const tableBody = document.querySelector("#training-table tbody");
const keywordInput = document.getElementById("keyword");
const langFilter = document.getElementById("filter-lang");
let trainingData = [];

async function loadTraining() {
  const res = await fetch("http://127.0.0.1:8000/get-training-data");
  const data = await res.json();
  trainingData = data.training_data;

  const keyword = keywordInput.value.toLowerCase();
  const lang = langFilter.value;

  const filtered = trainingData.filter(item =>
    (!lang || item.lang === lang) &&
    (item.question.toLowerCase().includes(keyword) || item.answer.toLowerCase().includes(keyword))
  );

  tableBody.innerHTML = "";
  filtered.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.lang}</td><td>${item.question}</td><td>${item.answer}</td>`;
    tableBody.appendChild(row);
  });

  renderCharts(filtered);
}

function renderCharts(data) {
  const ctxLang = document.getElementById("langChart").getContext("2d");
  const ctxLen = document.getElementById("lenChart").getContext("2d");

  const langCount = {};
  const qLen = [], aLen = [];
  data.forEach(item => {
    langCount[item.lang] = (langCount[item.lang] || 0) + 1;
    qLen.push(item.question.length);
    aLen.push(item.answer.length);
  });

  new Chart(ctxLang, {
    type: 'pie',
    data: { labels: Object.keys(langCount), datasets: [{ label: 'Languages', data: Object.values(langCount), backgroundColor: ['#1abc9c','#16a085','#27ae60'] }] },
    options: { responsive: true }
  });

  new Chart(ctxLen, {
    type: 'bar',
    data: {
      labels: data.map((_, i) => i+1),
      datasets: [
        { label: 'Q length', data: qLen, backgroundColor: '#1abc9c' },
        { label: 'A length', data: aLen, backgroundColor: '#16a085' }
      ]
    },
    options: { responsive: true, scales: { y: { beginAtZero:true } } }
  });
}

loadTraining();
