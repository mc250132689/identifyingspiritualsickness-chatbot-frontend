const API="https://identifyingspiritualsickness-chatbot.onrender.com";
const form=document.getElementById("feedback-form");
const responseElem=document.getElementById("feedback-response");
const listElem=document.getElementById("feedback-list");

async function loadFeedback(){
  try{
    const res=await fetch(`${API}/get-feedback?key=mc250132689`);
    const data=await res.json();
    listElem.innerHTML="";
    (data.feedback||[]).forEach(f=>{
      const div=document.createElement("div");
      div.className="feedback-entry";
      div.innerHTML=`<strong>${f.name}</strong>: ${f.message} <em>(${f.timestamp})</em>`;
      listElem.appendChild(div);
    });
  }catch(err){console.error(err);}
}
loadFeedback();

form.addEventListener("submit",async (e)=>{
  e.preventDefault();
  const name=document.getElementById("name").value.trim();
  const message=document.getElementById("message").value.trim();
  if(!name||!message){responseElem.textContent="Fill both fields.";return;}
  responseElem.textContent="Submitting...";
  try{
    await fetch(`${API}/submit-feedback`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,message})});
    responseElem.textContent="Thank you for your feedback!";
    document.getElementById("name").value="";
    document.getElementById("message").value="";
    loadFeedback();
  }catch(err){responseElem.textContent="Error submitting feedback."; console.error(err);}
});
