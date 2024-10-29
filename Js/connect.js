document.addEventListener("DOMContentLoaded", () => {
  const questionText = document.querySelector(".quiz__questionText");
  const answersContainer = document.querySelector(".quiz__answersContainer");
  const submitButton = document.querySelector(".quiz__submitBtn");
  const counterDisplay = document.querySelector(".quiz__counter");
  const moneyPyramid = Array.from(
    document.querySelectorAll(".money__piramidText")
  );
  const overlay = document.querySelector(".overlay");
  const overlayContent = document.querySelector(".overlay__content");
  const retryButton = document.querySelector(".retryButton");

  let quizData = [];
  let currentQuestionIndex = 0;
  let correctAnswersCount = 0;

  const fetchQuizData = () => {
    fetch(
      "https://opentdb.com/api.php?amount=12&difficulty=medium&type=multiple"
    )
      .then((response) => response.json())
      .then((data) => {
        quizData = data.results;
        displayQuestion();
      })
      .catch((error) => console.error("Fetch error:", error));
  };

  const displayQuestion = () => {
    const { question, incorrect_answers, correct_answer } =
      quizData[currentQuestionIndex];
    questionText.textContent = question;
    answersContainer.innerHTML = "";

    const answers = [...incorrect_answers, correct_answer].sort(
      () => Math.random() - 0.5
    );
    answersContainer.append(...createAnswerLabels(answers));

    submitButton.disabled = true;
    updateCounter();
  };

  const createAnswerLabels = (answers) => {
    return answers.map((answer) => {
      const answerLabel = document.createElement("label");
      answerLabel.className = "quiz__answer";
      answerLabel.textContent = answer;
      answerLabel.addEventListener("click", () =>
        checkAnswer(answerLabel, answer)
      );
      return answerLabel;
    });
  };

  const updateCounter = () => {
    counterDisplay.textContent = `Pytanie ${currentQuestionIndex + 1} z ${
      quizData.length
    }`;
  };

  const highlightPyramidLevel = () => {
    moneyPyramid.forEach((level) => level.classList.remove("highlighted"));
    const reverseIndex = moneyPyramid.length - correctAnswersCount;
    if (moneyPyramid[reverseIndex]) {
      moneyPyramid[reverseIndex].classList.add("highlighted");
    }
  };

  const checkAnswer = (selectedLabel, selectedAnswer) => {
    const correctAnswer = quizData[currentQuestionIndex].correct_answer;
    disableAnswerSelection();
    selectedLabel.classList.add("orange");

    setTimeout(() => {
      selectedLabel.classList.remove("orange");
      selectedLabel.classList.add(
        selectedAnswer === correctAnswer ? "correct" : "incorrect"
      );

      if (selectedAnswer === correctAnswer) {
        correctAnswersCount++;
        highlightPyramidLevel();
        submitButton.disabled = false;
      } else {
        highlightCorrectAnswer(correctAnswer);
        currentQuestionIndex === 0
          ? showGameOverOverlayWithoutMoney()
          : showGameOverOverlay();
      }
    }, 3000);
  };

  const showGameOverOverlay = () => {
    overlayContent.textContent = `Niestety przegrałeś! Ilość wygranych pieniędzy: ${
      moneyPyramid[moneyPyramid.length - correctAnswersCount].textContent
    }`;
    overlay.style.display = "flex";
    submitButton.disabled = true;
  };

  const showGameOverOverlayWithoutMoney = () => {
    overlayContent.textContent = "Niestety przegrałeś! Spróbuj ponownie.";
    overlay.style.display = "flex";
    submitButton.disabled = true;
  };

  const disableAnswerSelection = () => {
    answersContainer
      .querySelectorAll("label")
      .forEach((label) => (label.style.pointerEvents = "none"));
  };

  const highlightCorrectAnswer = (correctAnswer) => {
    Array.from(answersContainer.children).forEach((label) => {
      if (label.textContent === correctAnswer) label.classList.add("correct");
    });
  };

  submitButton.addEventListener("click", () => {
    if (++currentQuestionIndex < quizData.length) {
      displayQuestion();
    } else {
      overlayContent.textContent = "Quiz zakończony!";
      overlay.style.display = "flex";
    }
    submitButton.disabled = true;
  });

  retryButton.addEventListener("click", () => {
    location.reload(); 
  });

  fetchQuizData();
});
