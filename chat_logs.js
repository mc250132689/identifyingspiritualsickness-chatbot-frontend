const chatLogsTableBody = document.getElementById("chat-logs-table-body");
const ADMIN_KEY = prompt("Enter admin key to view chat logs:");

async function loadChatLogs() {
    const response = await fetch(`/chat-logs?key=${ADMIN_KEY}`);
    if (response.status === 401) {
        alert("Unauthorized");
        return;
    }

    const data = await response.json();
    chatLogsTableBody.innerHTML = "";

    data.chat_logs.forEach(log => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${log.id}</td>
            <td>${log.user}</td>
            <td>${log.bot}</td>
            <td>${log.lang}</td>
            <td>${log.time || ""}</td>
        `;
        chatLogsTableBody.appendChild(tr);
    });
}

document.addEventListener("DOMContentLoaded", loadChatLogs);
