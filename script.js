document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Script Loaded!");

    let currentQuestionIndex = 0;
    let userAnswers = {};
    let questions = [];
    let timerInterval;
    let timeLeft = 60; // Timer starts with 60 seconds

    /** ========== ✅ Timer Function ========== **/
    function startTimer() {
        console.log("🚀 Timer Started!");
        clearInterval(timerInterval); // Prevent multiple timers
        timeLeft = 60; // Reset time for each quiz

        let timerElement = document.getElementById("timer");
        if (!timerElement) {
            console.error("❌ Timer element NOT found in the DOM!");
            return;
        }

        updateTimerDisplay();

        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
                console.log(`⏳ Timer Updated: ${timeLeft}s`);
            } else {
                clearInterval(timerInterval);
                console.log("⏰ Time is up! Auto-submitting quiz.");
                alert("Time's up! Submitting your quiz...");
                autoSubmitQuiz();
            }
        }, 1000);
    }

    window.startTimer = startTimer; // ✅ Make startTimer() globally accessible

    /** ========== ✅ Update Timer Display ========== **/
    function updateTimerDisplay() {
        let timerElement = document.getElementById("timer");
        if (timerElement) {
            timerElement.textContent = `Time Left: ${timeLeft}s`;
        } else {
            console.error("⚠ Timer element NOT found in the DOM!");
        }
    }

    /** ========== ✅ Auto Submit on Timer End ========== **/
    function autoSubmitQuiz() {
        clearInterval(timerInterval);
        let category_id = new URLSearchParams(window.location.search).get("category_id");

        fetch("submit_quiz.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category_id, answers: userAnswers })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(`❌ Error: ${data.error}`);
            } else {
                window.location.href = `result.html?score=${data.score}`;
            }
        })
        .catch(error => console.error("❌ Error submitting quiz:", error));
    }

    /** ========== ✅ Load Quiz Data ========== **/
    function loadQuiz() {
        let category_id = new URLSearchParams(window.location.search).get("category_id");
        if (!category_id) {
            console.error("❌ Error: No category_id found in URL.");
            return;
        }

        fetch(`quiz.php?category_id=${category_id}`)
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    alert("⚠ No questions found for this category.");
                    return;
                }
                questions = data;
                currentQuestionIndex = 0;
                displayQuestion();
                setTimeout(startTimer, 500); // ✅ Start timer with a slight delay to ensure UI is loaded
            })
            .catch(error => console.error("❌ Error loading quiz:", error));
    }

    /** ========== ✅ Display Questions ========== **/
    function displayQuestion() {
        if (currentQuestionIndex >= questions.length) {
            document.getElementById("next-btn").style.display = "none";
            document.getElementById("submit-btn").style.display = "block";
            return;
        }

        let question = questions[currentQuestionIndex];
        if (!question) return;

        document.getElementById("question").innerText = question.question_text;
        document.getElementById("options").innerHTML = ["a", "b", "c", "d"].map(opt => `
            <input type="radio" name="answer" value="${opt}" id="${opt}">
            <label for="${opt}">${question["option_" + opt]}</label><br>
        `).join("");

        document.getElementById("next-btn").style.display = (currentQuestionIndex < questions.length - 1) ? "block" : "none";
        document.getElementById("submit-btn").style.display = (currentQuestionIndex === questions.length - 1) ? "block" : "none";
    }

    /** ========== ✅ Handle Button Clicks ========== **/
    document.addEventListener("click", function (event) {
        if (event.target && event.target.id === "next-btn") {
            let selectedOption = document.querySelector('input[name="answer"]:checked');
            if (!selectedOption) {
                alert("⚠ Please select an answer before proceeding.");
                return;
            }
            userAnswers[questions[currentQuestionIndex].id] = selectedOption.value;
            currentQuestionIndex++;
            displayQuestion();
        }

        if (event.target && event.target.id === "submit-btn") {
            let selectedOption = document.querySelector('input[name="answer"]:checked');
            if (!selectedOption) {
                alert("⚠ Please select an answer before submitting.");
                return;
            }
            userAnswers[questions[currentQuestionIndex].id] = selectedOption.value;

            clearInterval(timerInterval); // ✅ Stop timer on manual submission

            let category_id = new URLSearchParams(window.location.search).get("category_id");

            fetch("submit_quiz.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category_id, answers: userAnswers })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(`❌ Error: ${data.error}`);
                } else {
                    window.location.href = `result.html?score=${data.score}`;
                }
            })
            .catch(error => console.error("❌ Error submitting quiz:", error));
        }
    });

    /** ========== ✅ Load Quiz on Page Load ========== **/
    if (document.getElementById("question")) {
        console.log("📜 Loading Quiz...");
        loadQuiz();
    } else {
        console.error("❌ Quiz element NOT found!");
    }
});


/** ========== Load Leaderboard (With Categories) ========== **/
function loadLeaderboard() {
    fetch("leaderboard.php")
        .then(response => response.json())
        .then(data => {
            console.log("Leaderboard Data:", data); // Debugging

            const leaderboardTable = document.getElementById("leaderboard");
            if (!leaderboardTable) {
                console.error("Leaderboard table element not found!");
                return;
            }

            leaderboardTable.innerHTML = `
                <tr>
                    <th>Username</th>
                    <th>Category</th>
                    <th>Score</th>
                </tr>
            `;

            if (!Array.isArray(data) || data.length === 0) {
                leaderboardTable.innerHTML += `<tr><td colspan="3">No scores available.</td></tr>`;
                return;
            }

            data.forEach(entry => {
                leaderboardTable.innerHTML += `
                    <tr>
                        <td>${entry.username}</td>
                        <td>${entry.category || "N/A"}</td>
                        <td>${entry.score}</td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error("Error loading leaderboard:", error);
            const leaderboardTable = document.getElementById("leaderboard");
            if (leaderboardTable) {
                leaderboardTable.innerHTML += `<tr><td colspan="3">Failed to load leaderboard. Try again later.</td></tr>`;
            }
        });
}

/** ========== Run Leaderboard Load on Page Load ========== **/
if (document.getElementById("leaderboard")) {
    loadLeaderboard();
}

