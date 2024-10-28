document.addEventListener("DOMContentLoaded", () => {
  const questionText = document.querySelector(".quiz__questionText");
  const answersContainer = document.querySelector(".quiz__answersContainer");
  const submitButton = document.querySelector(".quiz__submitBtn");
  const counterDisplay = document.querySelector(".quiz__counter");
  const moneyPyramid = Array.from(document.querySelectorAll(".money__piramidText"));

  let quizData = [];
  let currentQuestionIndex = 0;
  let correctAnswersCount = 0;

  const fetchQuizData = () => {
    fetch("https://opentdb.com/api.php?amount=12&difficulty=medium&type=multiple")
      .then(response => response.json())
      .then(data => {
        quizData = data.results;
        displayQuestion();
      })
      .catch(console.error);
  };

  const displayQuestion = () => {
    const { question, correct_answer, incorrect_answers } = quizData[currentQuestionIndex];
    questionText.textContent = question;
    answersContainer.innerHTML = "";

    const answers = [...incorrect_answers, correct_answer].sort(() => Math.random() - 0.5);
    answersContainer.append(...createAnswerLabels(answers, correct_answer));
    
    submitButton.disabled = true;
    updateCounter();
  };

  const createAnswerLabels = (answers, correctAnswer) => {
    return answers.map(answer => {
      const answerLabel = document.createElement("label");
      answerLabel.classList.add("quiz__answer");
      answerLabel.textContent = answer;
      answerLabel.addEventListener("click", () => checkAnswer(answerLabel, answer, correctAnswer));
      return answerLabel;
    });
  };

  const updateCounter = () => {
    counterDisplay.textContent = `Pytanie ${currentQuestionIndex + 1} z ${quizData.length}`;
  };

  const highlightPyramidLevel = () => {
    moneyPyramid.forEach(level => level.classList.remove("highlighted"));
    const reverseIndex = moneyPyramid.length - correctAnswersCount;
    if (moneyPyramid[reverseIndex]) moneyPyramid[reverseIndex].classList.add("highlighted");
  };

  const checkAnswer = (selectedLabel, selectedAnswer, correctAnswer) => {
    disableAnswerSelection();
    selectedLabel.classList.add("orange");

    setTimeout(() => {
      selectedLabel.classList.remove("orange");
      selectedLabel.classList.add(selectedAnswer === correctAnswer ? "correct" : "incorrect");

      if (selectedAnswer === correctAnswer) {
        correctAnswersCount++;
        highlightPyramidLevel();
        submitButton.disabled = false;
      } else {
        highlightCorrectAnswer(correctAnswer);
        submitButton.disabled = false;
      }
    }, 3000);
  };

  const disableAnswerSelection = () => {
    answersContainer.querySelectorAll("label").forEach(label => label.style.pointerEvents = 'none');
  };

  const highlightCorrectAnswer = (correctAnswer) => {
    Array.from(answersContainer.children).forEach(label => {
      if (label.textContent === correctAnswer) label.classList.add("correct");
    });
  };

  submitButton.addEventListener("click", () => {
    if (++currentQuestionIndex < quizData.length) {
      displayQuestion();
    } else {
      alert("Quiz zakończony!");
    }
    submitButton.disabled = true;
  });

  fetchQuizData();
});
