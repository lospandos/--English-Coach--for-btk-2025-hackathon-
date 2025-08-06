document.getElementById("speakBtn").addEventListener("click", () => {
  const text = document.getElementById("textInput").value.trim();
  if (!text) {
    alert("Please enter some text to speak!");
    return;
  }

  // Eğer konuşma devam ediyorsa durdur
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US"; // İngilizce sesi
  utterance.rate = 0.7;       // Konuşma hızı (0.1 - 10 arasında)
  utterance.pitch = 1.2;      // Ses perdesi (0 - 2 arasında)

  window.speechSynthesis.speak(utterance);
});
