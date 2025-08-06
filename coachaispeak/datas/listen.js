const sentences = [ 
  "I like to eat apples and bananas every morning.",
  "She is my best friend and we study together at school.",
  "We go to school every day by bus and learn new things."
];

const hints = [
  "A sentence about enjoying fruits in the morning.",
  "Talking about a close female friend and studying together.",
  "Describes daily travel to school and learning."
];

const maxScore = 3;
const scores = [maxScore, maxScore, maxScore];
const usedJoker = [false, false, false];

function speakSentence(text, rate = 1) {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

const playButtons = document.querySelectorAll(".play-btn");
const playSlowButtons = document.querySelectorAll(".play-slow-btn");
const checkButtons = document.querySelectorAll(".check-btn");
const answerBoxes = document.querySelectorAll(".answer-box");
const feedbacks = document.querySelectorAll(".feedback");
const hintButtons = document.querySelectorAll(".hint-btn");
const hintsDivs = document.querySelectorAll(".hint");
const scoresDivs = document.querySelectorAll(".score");

playButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const i = parseInt(btn.dataset.index);
    speakSentence(sentences[i], 1);
  });
});

playSlowButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const i = parseInt(btn.dataset.index);
    speakSentence(sentences[i], 0.6);
  });
});

hintButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const i = parseInt(btn.dataset.index);
    if (!usedJoker[i]) {
      // Göster ipucu
      hintsDivs[i].style.display = "block";
      hintsDivs[i].textContent = hints[i];
      // Puan düşür
      scores[i] = Math.max(0, scores[i] - 1);
      scoresDivs[i].textContent = `Score: ${scores[i]}`;
      // Butonu pasif yap
      btn.disabled = true;
      usedJoker[i] = true;
    }
  });
});

checkButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const i = parseInt(btn.dataset.index);
    const userAnswer = answerBoxes[i].value.trim().toLowerCase();
    const correctAnswer = sentences[i].toLowerCase();

    if (!userAnswer) {
      feedbacks[i].textContent = "Please type your answer!";
      feedbacks[i].style.color = "#f59e0b";
      return;
    }

    if (userAnswer === correctAnswer) {
      feedbacks[i].textContent = `✅ Perfect! You got it exactly right. Your score: ${scores[i]}`;
      feedbacks[i].style.color = "#10b981";
    } else {
      const userWords = userAnswer.split(/\s+/);
      const correctWords = correctAnswer.split(/\s+/);

      let correctCount = 0;
      userWords.forEach(word => {
        if (correctWords.includes(word)) correctCount++;
      });

      feedbacks[i].textContent = `⚠️ You got ${correctCount} out of ${correctWords.length} words correct. Your score: ${scores[i]}`;
      feedbacks[i].style.color = "#f87171";
    }
  });
});
