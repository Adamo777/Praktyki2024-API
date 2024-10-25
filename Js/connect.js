document.addEventListener("DOMContentLoaded", () => {
    const quizSection = document.querySelector(".quiz");
    const questionText = document.querySelector(".quiz__questionText");
    const answersContainer = document.querySelector(".quiz__answersContainer");
    const submitButton = document.querySelector(".quiz__submitBtn");
  
    let quizData = [];
    let currentQuestionIndex = 0;
    let correctAnswer = "";
  
    function fetchQuizData() {
        fetch("https://opentdb.com/api.php?amount=12&difficulty=medium&type=multiple")
          .then(response => response.json())
          .then(data => {
            quizData = data.results;
            displayQuestion();
          })
          .catch(error => {
            console.error("Error fetching quiz data:", error);
          });
      }
  

    function displayQuestion() {
      const questionData = quizData[currentQuestionIndex];
      questionText.textContent = questionData.question;
      correctAnswer = questionData.correct_answer;

      const answers = [...questionData.incorrect_answers, correctAnswer].sort(() => Math.random() - 0.5);
  

      answersContainer.innerHTML = "";
  

      answers.forEach(answer => {
        const answerLabel = document.createElement("label");
        answerLabel.classList.add("quiz__answer");
        answerLabel.textContent = answer;
        answerLabel.addEventListener("click", () => checkAnswer(answerLabel, answer));
        answersContainer.appendChild(answerLabel);
      });
    }
  

    function checkAnswer(selectedLabel, selectedAnswer) {
      // Clear previous styles
      Array.from(answersContainer.children).forEach(label => {
        label.classList.remove("correct", "incorrect");
      });
  
      if (selectedAnswer === correctAnswer) {
        selectedLabel.classList.add("correct");
      } else {
        selectedLabel.classList.add("incorrect");
      }
    }

    submitButton.addEventListener("click", () => {
      if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
      } 
    });
  

    fetchQuizData();
  });