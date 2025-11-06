const feedbackTableBody = document.getElementById("feedback-table-body");
const ADMIN_KEY = prompt("Enter admin key to view feedback:");

async function loadFeedback() {
    const response = await fetch(`/feedbacks?key=${ADMIN_KEY}`);
    if (response.status === 401) {
        alert("Unauthorized");
        return;
    }

    const data = await response.json();
    feedbackTableBody.innerHTML = "";

    data.feedbacks.forEach(fb => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${fb.id}</td>
            <td>${fb.text}</td>
            <td>${fb.created_at || ""}</td>
        `;
        feedbackTableBody.appendChild(tr);
    });
}

document.addEventListener("DOMContentLoaded", loadFeedback);
