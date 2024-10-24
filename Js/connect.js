"use strict";

fetch("https://opentdb.com/api.php?amount=15").then((result) => {
  console.log(result);
});
