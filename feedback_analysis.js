const FEEDBACK_DATA_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/get-feedback";
const ADMIN_KEY = "mc250132689"; // insert your actual admin key

async function loadFeedback() {
  try {
    const response = await fetch(`https://identifyingspiritualsickness-chatbot.onrender.com/feedback-analysis?key=${ADMIN_KEY}`);
    const data = await response.json();

    // Fill feedback count
    document.getElementById("feedbackCount").innerText = data.feedback_count;

    // Fill sentiment stats
    document.getElementById("positiveCount").innerText = data.sentiments.positive;
    document.getElementById("neutralCount").innerText = data.sentiments.neutral;
    document.getElementById("negativeCount").innerText = data.sentiments.negative;

    // Fill top keywords list
    const keywordList = document.getElementById("keywordList");
    keywordList.innerHTML = "";
    data.top_keywords.forEach(word => {
      const li = document.createElement("li");
      li.textContent = word;
      keywordList.appendChild(li);
    });

    // Fill table with feedback list
    const tbody = document.getElementById("feedbackTableBody");
    tbody.innerHTML = "";
    data.feedback_list.forEach(item => {
      const row = `
        <tr>
          <td>${item.feeling || "-"}</td>
          <td>${item.comments || "-"}</td>
          <td>${item.date || "-"}</td>
        </tr>
      `;
      tbody.innerHTML += row;
    });

  } catch (error) {
    console.error("Error loading feedback:", error);
  }
}

window.onload = loadFeedback;
setInterval(loadFeedback, 5000);
