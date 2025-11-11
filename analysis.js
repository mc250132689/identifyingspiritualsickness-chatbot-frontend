const TRAIN_DATA_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/get-training-data";

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

async function loadTrainingData() {
  try {
    const res = await fetch(TRAIN_DATA_URL);
    const data = await res.json();
    if (!data.training_data) return;

    const trainingData = data.training_data;
    document.getElementById("total-count").textContent = trainingData.length;

    // Fill Q&A Table
    const tbody = document.querySelector("#data-table tbody");
    tbody.innerHTML = "";
    trainingData.forEach((item, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${item.question}</td>
        <td>${item.answer}</td>
      `;
      tbody.appendChild(tr);
    });

    // Word Frequency
    const text = trainingData.map(x => x.question + " " + x.answer).join(" ").toLowerCase();
    const words = text.replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/);
    const stopWords = ["the","is","and","of","to","a","in","it","you","for","that","with","on","as","are","be","was","i","or","from","by"];
    const counts = {};
    words.forEach(w => {
      if (!stopWords.includes(w) && w.length > 2) counts[w] = (counts[w] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 10);
    const labels = sorted.map(x => x[0]);
    const values = sorted.map(x => x[1]);

    new Chart(document.getElementById("chart"), {
      type: "bar",
      data: { labels, datasets: [{ label: "Common Words", data: values }] }
    });

    // Duplicate Question Detection
    const groups = {};
    for (let i = 0; i < trainingData.length; i++) {
      const qi = normalize(trainingData[i].question);
      for (let j = i + 1; j < trainingData.length; j++) {
        const qj = normalize(trainingData[j].question);
        if (qi && qj && qi === qj) {
          groups[qi] = groups[qi] || [];
          groups[qi].push(trainingData[j].question);
        }
      }
    }
    const duplicateContainer = document.getElementById("duplicate-list");
    duplicateContainer.innerHTML = "";
    if (Object.keys(groups).length === 0) {
      duplicateContainer.innerHTML = "<p>No duplicates found.</p>";
    } else {
      for (let base in groups) {
        const block = document.createElement("div");
        block.innerHTML = `<strong>${base}</strong><br>- ${groups[base].join("<br>- ")}`;
        duplicateContainer.appendChild(block);
      }
    }

    // Category Classification
    const categories = {
      "Ruqyah & Protection": ["ruqyah","jin","magic","sihr","ayn","protection","taweez"],
      "Emotional Distress": ["stress","fear","anxiety","sad","depression","worry"],
      "Aqidah Issues": ["faith","belief","doubt","deen","aqidah"],
      "Dreams & Sleep": ["dream","nightmare","sleep","insomnia"]
    };

    const categoryCount = {};
    trainingData.forEach(entry => {
      const q = normalize(entry.question);
      let found = false;
      for (const cat in categories) {
        if (categories[cat].some(w => q.includes(w))) {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
          found = true;
        }
      }
      if (!found) categoryCount["Uncategorized"] = (categoryCount["Uncategorized"] || 0) + 1;
    });

    const catTable = document.getElementById("category-table");
    catTable.innerHTML = "";
    for (const cat in categoryCount) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${cat}</td><td>${categoryCount[cat]}</td>`;
      catTable.appendChild(row);
    }

  } catch (err) {
    console.error("Error loading training data", err);
  }
}

loadTrainingData();
setInterval(loadTrainingData, 7000);
