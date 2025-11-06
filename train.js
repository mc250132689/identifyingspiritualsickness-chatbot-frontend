const form = document.getElementById("train-form");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = document.getElementById("question").value;
    const answer = document.getElementById("answer").value;
    const res = await fetch("/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer })
    });
    const data = await res.json();
    alert(data.message);
    location.reload();
});
