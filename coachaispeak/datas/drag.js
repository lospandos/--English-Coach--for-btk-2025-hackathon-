const wordPairs = [
  { en: "go", tr: "gitmek" },
  { en: "come", tr: "gelmek" },
  { en: "eat", tr: "yemek" },
  { en: "drink", tr: "içmek" },
  { en: "see", tr: "görmek" },
  { en: "run", tr: "koşmak" },
  { en: "walk", tr: "yürümek" },
  { en: "sleep", tr: "uyumak" },
  { en: "read", tr: "okumak" },
  { en: "write", tr: "yazmak" },
  { en: "I am happy.", tr: "Ben mutluyum." },
  { en: "She is tired.", tr: "O yorgun." },
  { en: "They are here.", tr: "Onlar burada." },
  { en: "It is raining.", tr: "Yağmur yağıyor." },
  { en: "Open the window.", tr: "Pencereyi aç." },
  { en: "Close the door.", tr: "Kapıyı kapat." },
  { en: "Can you help me?", tr: "Bana yardım edebilir misin?" },
  { en: "I don’t understand.", tr: "Anlamıyorum." },
  { en: "Where are you?", tr: "Neredesin?" },
  { en: "What is your name?", tr: "Adın ne?" },
  { en: "My name is Ali.", tr: "Benim adım Ali." },
  { en: "Thank you!", tr: "Teşekkür ederim!" },
  { en: "You're welcome.", tr: "Rica ederim." },
  { en: "I like it.", tr: "Onu beğendim." },
  { en: "I don't like it.", tr: "Onu beğenmedim." },
  { en: "How are you?", tr: "Nasılsın?" },
  { en: "I’m fine, thanks.", tr: "İyiyim, teşekkürler." },
  { en: "Let’s go!", tr: "Hadi gidelim!" },
  { en: "Be careful!", tr: "Dikkat et!" },
  { en: "Don’t worry.", tr: "Endişelenme." },
  { en: "See you later.", tr: "Sonra görüşürüz." },
  { en: "Good morning.", tr: "Günaydın." },
  { en: "Good night.", tr: "İyi geceler." },
  { en: "Excuse me.", tr: "Afedersiniz." },
  { en: "Sorry.", tr: "Üzgünüm." },
  { en: "Yes", tr: "Evet" },
  { en: "No", tr: "Hayır" },
  { en: "Maybe", tr: "Belki" },
  { en: "Always", tr: "Her zaman" },
  { en: "Never", tr: "Asla" },
  { en: "Sometimes", tr: "Bazen" },
  { en: "Often", tr: "Sık sık" },
  { en: "Usually", tr: "Genellikle" },
  { en: "Rarely", tr: "Nadiren" },
  { en: "Friend", tr: "Arkadaş" },
  { en: "Family", tr: "Aile" },
  { en: "Teacher", tr: "Öğretmen" },
  { en: "Student", tr: "Öğrenci" },
  { en: "School", tr: "Okul" },
  { en: "Book", tr: "Kitap" },
  { en: "Pen", tr: "Kalem" }
  // Buraya toplam 50 kelime ekleyebilirsin
];

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// DOM elementleri
const draggablesContainer = document.querySelector(".draggables");
const droppablesContainer = document.querySelector(".droppables");
const scoreDisplay = document.getElementById("scoreDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const newGameBtn = document.getElementById("newGameBtn");
const successSound = new Audio('assets/sounds.mp3');

let shuffledPairs = [];
let matchedCount = 0;
let timer;
let timeLeft = 120; // süre saniye cinsinden, örn 2 dakika


function addClickToSpeak() {
  document.querySelectorAll(".word").forEach(word => {
    word.addEventListener("click", () => {
      const utterance = new SpeechSynthesisUtterance(word.dataset.en);
      utterance.lang = "en-US";
      speechSynthesis.speak(utterance);
    });
  });
}
function initGame() {
  // Temizle
  draggablesContainer.innerHTML = "";
  droppablesContainer.innerHTML = "";
  matchedCount = 0;
  updateScore();
  resetTimer();

  // Karışık kelimeleri al
  shuffledPairs = shuffleArray(wordPairs).slice(0, 10); // örnek: 10 kelime ile oynanacak

  // İngilizce kelimeler draggable
  shuffledPairs.forEach(({ en }, index) => {
    const wordDiv = document.createElement("div");
    wordDiv.classList.add("word");
    wordDiv.textContent = en;
    wordDiv.draggable = true;
    wordDiv.id = `word-${index}`;
    wordDiv.dataset.en = en;
    draggablesContainer.appendChild(wordDiv);
  });

  // Türkçe karşılıklar droppable, karışık
  const shuffledTr = shuffleArray(shuffledPairs.map(p => p.tr));
  shuffledTr.forEach((trWord, index) => {
    const dropDiv = document.createElement("div");
    dropDiv.classList.add("droppable");
    dropDiv.id = `drop-${index}`;
    dropDiv.dataset.tr = trWord;
    dropDiv.textContent = trWord;
    droppablesContainer.appendChild(dropDiv);
  });
   // mevcut sürükle bırak olaylarını ekleyen fonksiyon
  addClickToSpeak();        // **buraya** kelimelere tıklayınca ses çıkaran fonksiyonu ekle
  
  addDragDropListeners();
  startTimer();
}

function addDragDropListeners() {
  let draggedWord = null;

  document.querySelectorAll(".word").forEach(word => {
    word.addEventListener("dragstart", e => {
      draggedWord = e.target;
      e.dataTransfer.setData("text/plain", draggedWord.id);
      setTimeout(() => draggedWord.classList.add("hide"), 0);
    });

    word.addEventListener("dragend", e => {
      draggedWord.classList.remove("hide");
      draggedWord = null;
    });
  });

  document.querySelectorAll(".droppable").forEach(dropZone => {
    dropZone.addEventListener("dragover", e => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", e => {
      dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", e => {
      e.preventDefault();
      dropZone.classList.remove("drag-over");

      if (!draggedWord) return;

      const draggedEn = draggedWord.dataset.en;
      const dropTr = dropZone.dataset.tr;

      const correctPair = shuffledPairs.find(p => p.en === draggedEn && p.tr === dropTr);

      if (correctPair) {
        dropZone.textContent = draggedEn + " ✔️";
        dropZone.classList.add("correct");
        draggedWord.style.display = "none";
        dropZone.draggable = false;
        matchedCount++;
        updateScore();

        successSound.play(); 
        if (matchedCount === shuffledPairs.length) {
          clearInterval(timer);
          alert("Tebrikler! Tüm eşleşmeleri doğru yaptınız.");
        }
      } else {
        dropZone.classList.add("incorrect");
        setTimeout(() => dropZone.classList.remove("incorrect"), 800);
      }
    });
  });
}

function updateScore() {
  if (!scoreDisplay) return;
  scoreDisplay.textContent = `Score: ${matchedCount} / ${shuffledPairs.length}`;
}

function startTimer() {
  if (!timerDisplay) return;
  timeLeft = 120; // 2 dakika
  timerDisplay.textContent = `Time Left: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("Süre doldu! Oyun sona erdi.");
      disableAllDraggables();
    }
  }, 1000);
}

function resetTimer() {
  if (timer) {
    clearInterval(timer);
  }
  if (timerDisplay) timerDisplay.textContent = "";
}

function disableAllDraggables() {
  document.querySelectorAll(".word").forEach(word => {
    word.draggable = false;
    word.style.opacity = "0.5";
  });
}

// Yeni oyun butonuna tıklayınca
newGameBtn.addEventListener("click", () => {
  initGame();
});

// Sayfa yüklendiğinde başlat
window.addEventListener("DOMContentLoaded", () => {
  initGame();
});
