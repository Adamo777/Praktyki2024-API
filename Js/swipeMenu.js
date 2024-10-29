"use strict";

(function() {
  const swipeIcon = document.querySelector(".swipeMenu");
  const moneyTable = document.querySelector(".moneyUnvisible");

  swipeIcon.addEventListener("click", () => {
    moneyTable.classList.toggle("unvisible");
  });
})();