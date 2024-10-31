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
  const overlayWin = document.querySelector(".overlayWin");
  const overlayWinContent = document.querySelector(".overlayWin__content");
  const hintButton = document.querySelector(".money__piramid--buttonFirst");
  const changeQuestionButton = document.querySelector(
    ".money__piramid--buttonSecond"
  );

  const quizState = {
    quizData: [],
    currentQuestionIndex: 0,
    correctAnswersCount: 0,
    questionStage: "easy",
    lastCheckpoint: 0,
  };

  const difficultySettings = {
    easy: { difficulty: "easy", amount: 5, next: "medium" },
    medium: { difficulty: "medium", amount: 5, next: "hard" },
    hard: { difficulty: "hard", amount: 2, next: null },
  };

  const checkpoints = [2000, 40000, 1000000];

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
    const { difficulty, amount } = difficultySettings[quizState.questionStage];
    fetchQuizData(difficulty, amount).then((data) => {
      quizState.quizData = data;
      quizState.currentQuestionIndex = 0;
      displayQuestion();
    });
  };

  const decodeHtmlEntities = (text) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  const displayQuestion = () => {
    if (quizState.currentQuestionIndex >= quizState.quizData.length) {
      quizState.questionStage =
        difficultySettings[quizState.questionStage].next;
      if (quizState.questionStage) {
        loadQuestions();
      } else {
        endQuiz();
      }
      return;
    }

    const { question, incorrect_answers, correct_answer } =
      quizState.quizData[quizState.currentQuestionIndex];
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
      answerLabel.textContent = decodeHtmlEntities(answer);
      answerLabel.addEventListener("click", () =>
        checkAnswer(answerLabel, answer)
      );
      return answerLabel;
    });
  };

  const updateCounter = () => {
    counterDisplay.textContent = `Poziom: ${
      difficultySettings[quizState.questionStage].difficulty
    } - Pytanie ${quizState.currentQuestionIndex + 1} z ${
      quizState.quizData.length
    }`;
  };

  const highlightPyramidLevel = () => {
    moneyPyramid.forEach((level) => level.classList.remove("highlighted"));
    const index = moneyPyramid.length - quizState.correctAnswersCount;
    if (moneyPyramid[index]) {
      moneyPyramid[index].classList.add("highlighted");
    }
  };

  const checkAnswer = (selectedLabel, selectedAnswer) => {
    const correctAnswer =
      quizState.quizData[quizState.currentQuestionIndex].correct_answer;
    disableAnswerSelection();
    selectedLabel.classList.add("orange");

    setTimeout(() => {
      selectedLabel.classList.remove("orange");
      selectedLabel.classList.add(
        selectedAnswer === correctAnswer ? "correct" : "incorrect"
      );

      if (selectedAnswer === correctAnswer) {
        quizState.correctAnswersCount++;
        highlightPyramidLevel();

        if (quizState.correctAnswersCount === moneyPyramid.length) {
          endQuiz();
        } else {
          submitButton.disabled = false;
        }

        const currentMoneyValue = parseInt(
          moneyPyramid[moneyPyramid.length - quizState.correctAnswersCount]
            .textContent
        );

        if (checkpoints.includes(currentMoneyValue)) {
          quizState.lastCheckpoint = currentMoneyValue;
        }
      } else {
        highlightCorrectAnswer(correctAnswer);
        showGameOverOverlay();
      }
    }, 3000);
  };

  const showGameOverOverlay = () => {
    overlayContent.textContent =
      quizState.lastCheckpoint > 0
        ? `Niestety przegrałeś! Ilość wygranych pieniędzy: ${quizState.lastCheckpoint} zł`
        : "Niestety przegrałeś! Spróbuj ponownie.";
    overlay.style.display = "flex";
    submitButton.disabled = true;
  };

  const disableAnswerSelection = () => {
    answersContainer.querySelectorAll("label").forEach((label) => {
      label.style.pointerEvents = "none";
    });
  };

  const highlightCorrectAnswer = (correctAnswer) => {
    Array.from(answersContainer.children).forEach((label) => {
      if (label.textContent === correctAnswer) {
        label.classList.add("correct");
      }
    });
  };

  const changeToNewQuestion = () => {
    changeQuestionButton.disabled = true;
    changeQuestionButton.style.opacity = 0.5;

    const { difficulty } = difficultySettings[quizState.questionStage];
    fetchQuizData(difficulty, 1).then((data) => {
      quizState.quizData[quizState.currentQuestionIndex] = data[0];
      displayQuestion();
    });
  };

  hintButton.addEventListener("click", () => {
    const labels = Array.from(answersContainer.children);
    const incorrectLabels = labels.filter(
      (label) =>
        label.textContent !==
        quizState.quizData[quizState.currentQuestionIndex].correct_answer
    );
    const [firstIncorrect, secondIncorrect] = incorrectLabels
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    firstIncorrect.classList.add("incorrect");
    secondIncorrect.classList.add("incorrect");
    hintButton.disabled = true;
    hintButton.style.opacity = 0.5;
  });

  changeQuestionButton.addEventListener("click", changeToNewQuestion);
  submitButton.addEventListener("click", () => {
    quizState.currentQuestionIndex++;
    displayQuestion();
  });

  retryButton.addEventListener("click", () => location.reload());

  const endQuiz = () => {
    overlayWinContent.textContent = "Brawo, Wygrałeś 1 000 000zł!";
    overlayWin.style.display = "flex";
    retryButton.style.display = "none";
  };

  loadQuestions();
});
