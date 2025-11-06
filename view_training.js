const trainingTableBody = document.getElementById("training-table-body");

async function loadTrainingData() {
    const response = await fetch("/get-training-data");
    const data = await response.json();
    trainingTableBody.innerHTML = "";

    data.training_data.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.question}</td>
            <td>${item.answer}</td>
            <td>${item.lang}</td>
            <td>${item.created_at || ""}</td>
        `;
        trainingTableBody.appendChild(tr);
    });
}

document.addEventListener("DOMContentLoaded", loadTrainingData);
