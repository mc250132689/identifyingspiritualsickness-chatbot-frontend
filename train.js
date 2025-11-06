const trainForm = document.getElementById("train-form");
const trainResponse = document.getElementById("train-response");

trainForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = document.getElementById("question").value.trim();
    const answer = document.getElementById("answer").value.trim();
    if (!question || !answer) return;

    const response = await fetch("/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer })
    });

    const data = await response.json();
    trainResponse.textContent = data.message;
    trainForm.reset();
});
