const FEEDBACK_DATA_URL="https://identifyingspiritualsickness-chatbot.onrender.com/get-feedback";

async function loadFeedback(){
  const res=await fetch(FEEDBACK_DATA_URL);
  const data=await res.json();
  document.getElementById("total-count").textContent=data.length;

  let scores=data.map(f=>parseFloat(f.q8)).filter(n=>!isNaN(n));
  let avg=scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(2):"No data";
  document.getElementById("avg-score").textContent=avg;

  let text=data.map(f=>f.comments||"").join(" ").toLowerCase();
  let words=text.split(/\s+/).filter(w=>w.length>4);
  let freq={};
  words.forEach(w=>freq[w]=(freq[w]||0)+1);
  let sorted=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,7);
  document.getElementById("keywords").textContent=sorted.map(w=>w[0]).join(", ")||"No data";

  const tbody=document.querySelector("#feedback-table tbody");
  tbody.innerHTML="";
  data.forEach(f=>{
    let row=`<tr>
      <td>${f.name||"-"}</td>
      <td>${f.student_id||"-"}</td>
      <td>${f.program||"-"}</td>
      <td>${f.q8||"-"}</td>
      <td>${sorted[0]?sorted[0][0]:"-"}</td>
      <td>${f.comments||"-"}</td>
    </tr>`;
    tbody.insertAdjacentHTML("beforeend",row);
  });

  // --- Generate Charts ---
  const questions=["q4","q5","q6","q7","q8","q9","q10","q11","q12","q13","q14"];
  const container=document.getElementById("charts-container"); container.innerHTML="";
  const colorPalette=['#10b981','#3b82f6','#f97316','#f43f5e','#8b5cf6','#14b8a6','#facc15'];

  questions.forEach(q=>{
    const canvas=document.createElement("canvas"); canvas.id=q; container.appendChild(canvas);

    const counts={};
    data.forEach(f=>{ const val=f[q]||"Not answered"; counts[val]=(counts[val]||0)+1; });
    const labels=Object.keys(counts); const values=Object.values(counts);
    const total=values.reduce((a,b)=>a+b,0);
    const percentages=values.map(v=>((v/total)*100).toFixed(1)+"%");

    new Chart(canvas.getContext("2d"),{
      type:labels.length<=3?'pie':'bar',
      data:{ labels:labels, datasets:[{label:q,data:values,backgroundColor:labels.map((_,i)=>colorPalette[i%colorPalette.length])}] },
      options:{
        responsive:true,
        plugins:{
          legend:{display:true,position:'bottom'},
          tooltip:{
            callbacks:{
              label: function(ctx){
                return `${ctx.label}: ${ctx.raw} (${percentages[ctx.dataIndex]})`;
              }
            }
          },
          title:{display:true,text:`Question ${q.toUpperCase()}`}
        },
        scales: labels.length>3 ? { y:{beginAtZero:true} } : {}
      }
    });
  });
}

// --- PDF Export ---
document.getElementById("export-pdf-btn").addEventListener("click",async()=>{
  const container=document.getElementById("charts-container");
  const charts=container.querySelectorAll("canvas");
  if(charts.length===0){ alert("No charts to export"); return; }

  const pdf=new jspdf.jsPDF('p','mm','a4'); const pageWidth=pdf.internal.pageSize.getWidth(); const pageHeight=pdf.internal.pageSize.getHeight(); const margin=10;

  for(let i=0;i<charts.length;i++){
    const canvas=charts[i];
    await html2canvas(canvas,{scale:2}).then(canvasImg=>{
      const imgData=canvasImg.toDataURL('image/png');
      const imgProps=pdf.getImageProperties(imgData);
      const imgWidth=pageWidth-margin*2;
      const imgHeight=(imgProps.height*imgWidth)/imgProps.width;
      if(i>0) pdf.addPage();
      pdf.setFontSize(16);
      pdf.text(canvas.id.replace("q","Question "),margin,15);
      pdf.addImage(imgData,'PNG',margin,25,imgWidth,imgHeight);
    });
  }
  pdf.save("feedback_report.pdf");
});

loadFeedback();
