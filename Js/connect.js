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
  const hintButton = document.querySelector(".money__piramid--buttonFirst");
  const changeQuestionButton = document.querySelector(
    ".money__piramid--buttonSecond"
  );

  let quizData = [];
  let currentQuestionIndex = 0;
  let correctAnswersCount = 0;
  let questionStage = "easy";
  let difficultyLabel = "Łatwy";

  const difficultySettings = {
    easy: { difficulty: "easy", amount: 5, label: "Łatwy", next: "medium" },
    medium: { difficulty: "medium", amount: 5, label: "Średni", next: "hard" },
    hard: { difficulty: "hard", amount: 2, label: "Trudny", next: null },
  };

  const fetchQuizData = (difficulty, amount) => {
    return fetch(
      `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}&type=multiple`
    )
      .then((response) => response.json())
      .then((data) => data.results)
      .catch((error) => {
        console.error("Błąd pobierania:", error);
        return [];
      });
  };

  const loadQuestions = () => {
    const { difficulty, amount, label, next } =
      difficultySettings[questionStage];
    difficultyLabel = label;

    fetchQuizData(difficulty, amount).then((data) => {
      quizData = data;
      currentQuestionIndex = 0;
      displayQuestion();
    });
  };

  const displayQuestion = () => {
    if (currentQuestionIndex >= quizData.length) {
      questionStage = difficultySettings[questionStage].next;
      if (questionStage) {
        loadQuestions();
      } else {
        endQuiz();
      }
      return;
    }

    const decodeHtmlEntities = (text) => {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = text;
      return textarea.value;
    };

    const { question, incorrect_answers, correct_answer } =
      quizData[currentQuestionIndex];
    questionText.textContent = decodeHtmlEntities(question);
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
    counterDisplay.textContent = `Poziom: ${difficultyLabel} - Pytanie ${
      currentQuestionIndex + 1
    } z ${quizData.length}`;
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
        showGameOverOverlay(currentQuestionIndex === 0);
      }
    }, 3000);
  };

  const showGameOverOverlay = (withoutMoney) => {
    if (withoutMoney) {
      overlayContent.textContent = "Niestety przegrałeś! Spróbuj ponownie.";
    } else {
      overlayContent.textContent = `Niestety przegrałeś! Ilość wygranych pieniędzy: ${
        moneyPyramid[moneyPyramid.length - correctAnswersCount].textContent
      }`;
    }

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
      if (label.textContent === correctAnswer) {
        label.classList.add("correct");
      }
    });
  };

  const changeToNewQuestion = () => {
    const { difficulty } = difficultySettings[questionStage];

    changeQuestionButton.disabled = true;
    changeQuestionButton.style.opacity = 0.5;

    fetchQuizData(difficulty, 1).then((data) => {
      const reserveQuestion = data[0];
      quizData[currentQuestionIndex] = reserveQuestion;
      displayQuestion();
    });
  };

  hintButton.addEventListener("click", () => {
    const labels = Array.from(answersContainer.children);
    const incorrectLabels = labels.filter(
      (label) =>
        label.textContent !== quizData[currentQuestionIndex].correct_answer
    );

    if (incorrectLabels.length > 1) {
      const [firstIncorrect, secondIncorrect] = incorrectLabels
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

      firstIncorrect.classList.add("incorrect");
      secondIncorrect.classList.add("incorrect");
      hintButton.disabled = true;
      hintButton.style.opacity = 0.5;
    }
  });

  changeQuestionButton.addEventListener("click", changeToNewQuestion);
  submitButton.addEventListener("click", () => {
    currentQuestionIndex++;
    displayQuestion();
  });

  retryButton.addEventListener("click", () => location.reload());

  const endQuiz = () => {
    overlayContent.textContent = "Wygrałeś wszystkie poziomy!";
    overlay.style.display = "flex";
  };

  loadQuestions();
});
