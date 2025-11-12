const TRAIN_API_URL = "https://identifyingspiritualsickness-chatbot.onrender.com/train";
const form = document.getElementById("train-form");
const responseText = document.getElementById("train-response");
const preview = document.getElementById("train-preview");
const answerTextarea = document.getElementById("answer");

answerTextarea.addEventListener('input', () => {
  answerTextarea.style.height='auto';
  answerTextarea.style.height=answerTextarea.scrollHeight+'px';
});

function formatAnswer(text) {
  if(!text) return "";
  return text.replace(/\r\n|\r|\n/g,"<br>");
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const question = document.getElementById("question").value.trim();
  const answer = answerTextarea.value.trim();
  if(!question||!answer){ responseText.textContent="Please fill both fields."; return; }
  responseText.textContent="Submitting...";

  try {
    const res = await fetch(TRAIN_API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,answer})});
    const data = await res.json();
    responseText.innerHTML=data.message||"Submitted!";
    document.getElementById("question").value="";
    answerTextarea.value="";
    answerTextarea.style.height='auto';

    // Preview
    const userBubble=document.createElement("div");
    userBubble.className="train-user-msg"; userBubble.textContent=question;
    const botBubble=document.createElement("div");
    botBubble.className="train-bot-msg"; botBubble.innerHTML=formatAnswer(answer);
    const pair=document.createElement("div"); pair.className="train-msg-pair";
    pair.appendChild(userBubble); pair.appendChild(botBubble);
    preview.appendChild(pair); preview.scrollTop=preview.scrollHeight;

  } catch(err){ console.error(err); responseText.textContent="Error submitting."; }
});
