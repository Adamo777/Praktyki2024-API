document.addEventListener("DOMContentLoaded", () => {
  const questionText = document.querySelector(".quiz__questionText");
  const answersContainer = document.querySelector(".quiz__answersContainer");
  const submitButton = document.querySelector(".quiz__submitBtn");

  let quizData = [];
  let currentQuestionIndex = 0;

  const fetchQuizData = () => {
    fetch(
      "https://opentdb.com/api.php?amount=12&difficulty=medium&type=multiple"
    )
      .then((response) => response.json())
      .then((data) => {
        quizData = data.results;
        displayQuestion();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const displayQuestion = () => {
    const { question, correct_answer, incorrect_answers } =
      quizData[currentQuestionIndex];
    questionText.textContent = question;
    answersContainer.innerHTML = "";
    const answers = [...incorrect_answers, correct_answer].sort(
      () => Math.random() - 0.5
    ); //łączenie tablicy i losowanie pytania

    answers.forEach((answer) => {
      const answerLabel = document.createElement("label");
      answerLabel.classList.add("quiz__answer");
      answerLabel.textContent = answer;
      answerLabel.addEventListener("click", () =>
        checkAnswer(answerLabel, answer, correct_answer)
      );
      answersContainer.appendChild(answerLabel);
    });

    submitButton.disabled = true;
  };

  const checkAnswer = (selectedLabel, selectedAnswer, correctAnswer) => {
    Array.from(answersContainer.children).forEach((label) =>
      label.classList.remove("correct", "incorrect", "orange")
    );
    selectedLabel.classList.add("orange");

    setTimeout(() => {
      selectedLabel.classList.remove("orange");
      selectedLabel.classList.add(
        selectedAnswer === correctAnswer ? "correct" : "incorrect"
      );
      if (selectedAnswer !== correctAnswer)
        highlightCorrectAnswer(correctAnswer);
      setTimeout(randomizeQuestion, 2000);
    }, 3000);
  };

  const highlightCorrectAnswer = (correctAnswer) => {
    Array.from(answersContainer.children).forEach((label) => {
      if (label.textContent === correctAnswer) label.classList.add("correct");
    });
  };

  const randomizeQuestion = () => {
    currentQuestionIndex = (currentQuestionIndex + 1) % quizData.length;
    displayQuestion();
  };

  submitButton.addEventListener("click", () => {
    if (currentQuestionIndex < quizData.length - 1) {
      currentQuestionIndex++;
      displayQuestion();
    }
  });

  fetchQuizData();
});
