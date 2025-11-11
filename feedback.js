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
    q4: document.getElementById("q4").value.trim(),
    q5: document.getElementById("q5").value.trim(),
    q6: document.getElementById("q6").value.trim(),
    q7: document.getElementById("q7").value.trim(),
    q8: document.getElementById("q8").value.trim(),
    q9: document.getElementById("q9").value.trim(),
    q10: document.getElementById("q10").value.trim(),
    q11: document.getElementById("q11").value.trim(),
    q12: document.getElementById("q12").value.trim(),
    q13: document.getElementById("q13").value.trim(),
    q14: document.getElementById("q14").value.trim(),
    comments: document.getElementById("q14").value.trim()
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
    console.error(err);
    status.textContent = "Error submitting feedback. Please try later.";
  }
});
