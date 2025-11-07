const token = localStorage.getItem("access_token");
if (!token) window.location.href = "/login.html";

let conversationData = [];

// Load conversations
async function loadConversations() {
  try {
    const response = await fetch("/admin/conversations", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("access_token");
      window.location.href = "/login.html";
      return;
    }

    conversationData = await response.json();
    applySearchFilter();
  } catch (error) {
    console.error("Error loading conversations:", error);
  }
}

// Render table rows
function renderTable(data) {
  const tableBody = document.querySelector("#conversation-table tbody");
  tableBody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.user || "Anonymous"}</td>
      <td>${row.message}</td>
      <td>${row.reply}</td>
      <td>${row.timestamp}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// Search filter
function applySearchFilter() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const filtered = conversationData.filter(row =>
    (row.user || "").toLowerCase().includes(query) ||
    row.message.toLowerCase().includes(query) ||
    row.reply.toLowerCase().includes(query)
  );
  renderTable(filtered);
}

document.getElementById("search-input").addEventListener("input", applySearchFilter);

// Export to CSV
document.getElementById("export-btn").addEventListener("click", () => {
  let csv = "User,Message,Reply,Timestamp\n";
  conversationData.forEach(row => {
    csv += `"${row.user || "Anonymous"}","${row.message}","${row.reply}","${row.timestamp}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "conversations.csv";
  a.click();
});

// Manual refresh
document.getElementById("refresh-btn").addEventListener("click", loadConversations);

// Auto refresh every 5s
setInterval(loadConversations, 5000);

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("access_token");
  window.location.href = "/login.html";
});

// Initial load
loadConversations();
