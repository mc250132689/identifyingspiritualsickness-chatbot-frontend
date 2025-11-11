const FEEDBACK_API = "https://identifyingspiritualsickness-chatbot.onrender.com/submit-feedback";
const form = document.getElementById("feedback-form");
const status = document.getElementById("feedback-status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "Submitting...";

  const payload = {
    name: document.getElementById("name").value.trim(),
    student_id: document.getElementById("student_id").value.trim(),
    program: document.getElementById("program").value.trim(),
    q4: Number(document.getElementById("q4").value),
    q5: Number(document.getElementById("q5").value),
    q6: Number(document.getElementById("q6").value),
    q7: Number(document.getElementById("q7").value),
    q8: Number(document.getElementById("q8").value),
    q9: Number(document.getElementById("q9").value),
    q10: Number(document.getElementById("q10").value),
    q11: Number(document.getElementById("q11").value),
    q12: Number(document.getElementById("q12").value),
    q13: Number(document.getElementById("q13").value),
    q14: Number(document.getElementById("q14").value),
    comments: document.getElementById("comments").value.trim()
  };

  try {
    const res = await fetch(FEEDBACK_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    status.textContent = data.message || "Submitted. Thank you!";
    form.reset();

  } catch (err) {
    status.textContent = "Error submitting feedback. Please try again later.";
  }
});
