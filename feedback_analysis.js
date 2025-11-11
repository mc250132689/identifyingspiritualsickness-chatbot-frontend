const FEEDBACK_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/get-feedback";
const HF_API_KEY = "https://identifyingspiritualsickness-chatbot.onrender.com";
const MODEL_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest";

async function getSentimentAI(text) {
  try {
    const res = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text })
    });

    const result = await res.json();
    if (!Array.isArray(result) || !result[0]) return { label: "Neutral", class: "sentiment-neutral" };
    const scores = result[0];
    const sorted = scores.sort((a, b) => b.score - a.score)[0];

    if (sorted.label.toLowerCase().includes("positive"))
      return { label: "Positive", class: "sentiment-positive" };
    if (sorted.label.toLowerCase().includes("negative"))
      return { label: "Negative", class: "sentiment-negative" };
    return { label: "Neutral", class: "sentiment-neutral" };
  } catch {
    return { label: "Neutral", class: "sentiment-neutral" };
  }
}

async function loadFeedback() {
  try {
    const res = await fetch(FEEDBACK_URL);
    const feedback = await res.json();
    document.getElementById("total-feedback").textContent = feedback.length;

    let sentimentCount = { Positive: 0, Negative: 0, Neutral: 0 };
    let ratingSum = 0;

    const tbody = document.querySelector("#feedback-table tbody");
    tbody.innerHTML = "";

    for (let i = 0; i < feedback.length; i++) {
      const f = feedback[i];
      const sentiment = await getSentimentAI(f.comment);
      sentimentCount[sentiment.label]++;
      ratingSum += f.rating ? parseFloat(f.rating) : 0;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${f.name||"-"}</td>
        <td>${f.student_id||"-"}</td>
        <td>${f.rating||"-"}</td>
        <td>${f.comment}</td>
        <td class="${sentiment.class}">${sentiment.label}</td>
      `;
      tbody.appendChild(tr);
    }

    document.getElementById("average-rating").textContent = feedback.length>0 ? (ratingSum/feedback.length).toFixed(2) : 0;

    document.getElementById("sentiment-table").innerHTML = `
      <tr><td>Positive</td><td>${sentimentCount.Positive}</td></tr>
      <tr><td>Negative</td><td>${sentimentCount.Negative}</td></tr>
      <tr><td>Neutral</td><td>${sentimentCount.Neutral}</td></tr>
    `;

    const ctx = document.getElementById("sentimentChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Positive", "Neutral", "Negative"],
        datasets: [{
          label: "Sentiment Count",
          data: [sentimentCount.Positive, sentimentCount.Neutral, sentimentCount.Negative],
          backgroundColor: ["#16a34a","#444","#dc2626"]
        }]
      },
      options: { responsive:true, plugins:{legend:{display:false}} }
    });

    // Word frequency
    const text = feedback.map(f=>f.comment).join(" ").toLowerCase();
    const words = text.replace(/[^a-zA-Z0-9\s]/g,"").split(/\s+/);
    const stopWords = ["the","is","and","to","of","a","in","for","that","with","this","it","on","was","are","but","not","you"];
    const counts = {};
    words.forEach(w=>{ if(!stopWords.includes(w)&&w.length>3) counts[w]=(counts[w]||0)+1; });
    const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,12);
    document.getElementById("word-frequency").innerHTML = sorted.map(w=>`<span>${w[0]} (${w[1]})</span>`).join(" ");

  } catch(err){ console.log("Failed to load feedback",err); }
}

loadFeedback();
setInterval(loadFeedback, 10000);
