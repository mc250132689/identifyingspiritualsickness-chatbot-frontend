const ADMIN_KEY="mc250132689";
const API="https://identifyingspiritualsickness-chatbot.onrender.com";

async function loadData(){
  const res=await fetch(`${API}/get-training-data`);
  const data=await res.json();
  displayData(data.training_data);
}

function displayData(data){
  const table=document.getElementById("dataTable");
  table.innerHTML="";
  data.forEach(item=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${item.question}</td><td>${item.answer}</td><td>${item.lang}</td>
    <td><button class="delete-btn" onclick="deleteEntry('${item.question}')">Delete</button></td>`;
    table.appendChild(tr);
  });
}

document.getElementById("searchInput").addEventListener("keyup",function(){
  const filter=this.value.toLowerCase();
  document.querySelectorAll("#dataTable tr").forEach(row=>{
    row.style.display=row.innerText.toLowerCase().includes(filter)?"":"none";
  });
});

async function deleteEntry(question){
  if(!confirm("Delete this entry?")) return;
  await fetch(`${API}/delete-entry?question=${encodeURIComponent(question)}&key=${ADMIN_KEY}`,{method:"DELETE"});
  loadData();
}

function downloadCSV(){
  let rows=[["Question","Answer","Language"]];
  document.querySelectorAll("#dataTable tr").forEach(tr=>{
    let cols=tr.querySelectorAll("td");
    rows.push([cols[0].innerText,cols[1].innerText,cols[2].innerText]);
  });
  let blob=new Blob([rows.map(e=>e.join(",")).join("\n")],{type:"text/csv"});
  let link=document.createElement("a"); link.href=URL.createObjectURL(blob); link.download="training_data.csv"; link.click();
}

loadData();
