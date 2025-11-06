const API="https://identifyingspiritualsickness-chatbot.onrender.com";
async function loadChatLogs(){
  try{
    const res=await fetch(`${API}/get-chat-logs?key=mc250132689`);
    const data=await res.json();
    const tbody=document.getElementById("chatTable");
    tbody.innerHTML="";
    (data.logs||[]).forEach(row=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${row.user}</td><td>${row.message}</td><td>${row.timestamp}</td>`;
      tbody.appendChild(tr);
    });
  }catch(err){console.error(err);}
}
loadChatLogs();
