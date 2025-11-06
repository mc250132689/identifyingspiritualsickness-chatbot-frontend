const BASE_URL = "https://identifyingspiritualsickness-chatbot.onrender.com";
const loginBtn = document.getElementById("login-btn");
const loginSection = document.getElementById("login-section");
const dashboard = document.getElementById("dashboard");

loginBtn.addEventListener("click", async () => {
  const key = document.getElementById("admin-key").value.trim();
  if (!key) return alert("Enter Admin Key");

  try {
    const res = await fetch(`${BASE_URL}/admin-stats?key=${key}`);
    const data = await res.json();

    if (data.error) {
      document.getElementById("login-status").textContent = "❌ Invalid Key";
      return;
    }

    loginSection.style.display = "none";
    dashboard.style.display = "block";

    document.getElementById("total-records").textContent = data.total_records;
    document.getElementById("avg-q-len").textContent = data.avg_question_length;
    document.getElementById("avg-a-len").textContent = data.avg_answer_length;

    loadCharts();
    loadChatCount(key);
  } catch {
    document.getElementById("login-status").textContent = "⚠️ Server Offline";
  }
});

async function loadChatCount(key) {
  try {
    const res = await fetch(`${BASE_URL}/get-chat-logs?key=${key}`);
    const data = await res.json();
    document.getElementById("total-chats").textContent = data.logs.length;
  } catch { console.warn("No chat logs API found"); }
}

async function loadCharts() {
  const res = await fetch(`${BASE_URL}/get-training-data`);
  const data = await res.json();
  const training = data.training_data;

  let symptomCounts = {};
  training.forEach(d => {
    const q = d.question.toLowerCase();
    if (q.includes("jinn")) symptomCounts["Jinn"] = (symptomCounts["Jinn"]||0) + 1;
    if (q.includes("sihr")) symptomCounts["Sihr"] = (symptomCounts["Sihr"]||0) + 1;
    if (q.includes("nightmare")) symptomCounts["Nightmares"] = (symptomCounts["Nightmares"]||0) + 1;
  });

  new Chart(document.getElementById("symptomChart"), {
    type: 'bar',
    data: { labels: Object.keys(symptomCounts), datasets: [{ data: Object.values(symptomCounts) }] }
  });

  let langCounts = {};
  training.forEach(d => langCounts[d.lang] = (langCounts[d.lang]||0) + 1);

  new Chart(document.getElementById("langChart"), {
    type: 'pie',
    data: { labels: Object.keys(langCounts), datasets: [{ data: Object.values(langCounts) }] }
  });
}
