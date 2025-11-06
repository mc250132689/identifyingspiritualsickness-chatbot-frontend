const API = "https://identifyingspiritualsickness-chatbot.onrender.com/feedback";
const form = document.getElementById("feedbackForm");
const status = document.getElementById("status");
form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const text = document.getElementById("message").value.trim();
  if(!text) return;
  status.textContent = "Submitting...";
  try{
    const res = await fetch(API,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({text})
    });
    const data = await res.json();
    status.textContent = data.message || "Thanks for your feedback!";
    form.reset();
  }catch(err){
    status.textContent = "Unable to submit feedback.";
  }
});
