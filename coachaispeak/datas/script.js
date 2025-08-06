// Global değişken: son sesli metin
let lastSpeechResult = "";

// Form submit engelle ve mesaj gönder
document.getElementById("chatForm").addEventListener("submit", function (e) {
  e.preventDefault();
  sendMessage();
});
document.getElementById("detailedAnalysisBtn").disabled = true;
document.getElementById("detailedAnalysisBtn").disabled = false;

// API'den cevap alma fonksiyonu
async function getGeminiResponse(prompt, retries = 5) {
  const apiKey = "AIzaSyCTS1UefFXgvzLL2T2UUflwYT4VDVN3jL8"; // 🔐 Buraya kendi API anahtarını yaz 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      });

      const data = await res.json();

      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      if (data?.error?.message?.includes("overloaded")) {
        console.warn(`⚠️ Model yoğun (deneme ${attempt}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }

      if (data?.error) {
        return `API hatası: ${data.error.message}`;
      }

      return "Yanıt alınamadı.";

    } catch (err) {
      console.error("❌ Fetch hatası:", err);
      return "Bağlantı hatası oluştu.";
    }
  }

  return "Model aşırı yoğun. Lütfen daha sonra tekrar deneyin.";
}

document.getElementById("detailedAnalysisBtn").disabled = false;

// Kullanıcı mesajı gönderme
async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  addMessage("user", message);
  input.value = "";

  addMessage("ai", "Yükleniyor...");

  const response = await getGeminiResponse(message);
  updateLastBotMessage(response);
}

// Sesli konuşma değerlendirme
async function evaluateSpokenText(text) {
  const prompt = `Bir dil koçu gibi davran. Kullanıcının şu cümlesini İngilizce konuşma açısından değerlendir: "${text}". 
Kısa, yapıcı, profesyonel bir geri bildirim ver. Telaffuz, gramer ve anlam hatalarına odaklan.Türkçe yanıt ver.`;

  const feedback = await getGeminiResponse(prompt);
  document.getElementById("speechFeedback").textContent = feedback;  // Konuşma değerlendirmesini sağ kutuya yaz
}

// CEFR seviyesi analizi
async function evaluateEnglishLevel(text) {
  const prompt = `Aşağıdaki İngilizce cümleyi CEFR seviyesine göre değerlendir:
"${text}"
Yanıtın sadece seviyeyi (örneğin: A1, A2, B1, B2, C1, C2) ve kısa bir açıklama içersin. Daha iyi bir seviyeye çıkmak için ne geliştirilmeli, belirt.`;

  const levelFeedback = await getGeminiResponse(prompt);

  // Seviye tespitini sağ paneldeki kutucuğa yaz
  document.getElementById("levelFeedback").textContent = levelFeedback;
}

document.getElementById("detailedAnalysisBtn").addEventListener("click", async () => {
  const input = document.getElementById("userInput");
  const text = input.value.trim();

  if (!text) {
    alert("Lütfen analiz için bir metin girin.");
    return;
  }

  const btn = document.getElementById("detailedAnalysisBtn");
  btn.disabled = true;
  btn.textContent = "Analiz yapılıyor...";

  // Analiz başlat
  addMessage("ai", "🧠 Detaylı analiz başlatılıyor...");
  await evaluateEnglishLevel(text);
  await suggestCorrections(text);

  btn.textContent = "Detaylı Analiz Yap";
  btn.disabled = false;
});

// Düzeltme önerisi
async function suggestCorrections(text) {
  const prompt = `Bir İngilizce öğretmeni gibi davran. Aşağıdaki cümledeki gramer, kelime ve yapı hatalarını düzelt.
Yanıtın şu formatta olsun:
❌ Hatalı: ...
✅ Doğru: ...
📝 Açıklama: ...
Cümle: "${text}"`;

  const correction = await getGeminiResponse(prompt);

  // Eğer sayfada correctionFeedback ID'li bir yer varsa oraya yaz
  const correctionDiv = document.getElementById("correctionFeedback");
  if (correctionDiv) {
    correctionDiv.innerText = correction;
  }

  // Mevcut chat sistemin varsa aynı şekilde de yazmaya devam et
  //addMessage("ai", `✍️ Düzeltme: ${correction}`);
}


// Mesaj kutusuna mesaj ekleme
function addMessage(sender, text) {
  const box = document.getElementById("chatBox");
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "user-msg" : "ai-msg";
  msg.textContent = text;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}

// Son AI mesajını güncelle
function updateLastBotMessage(text) {
  const messages = document.querySelectorAll(".ai-msg");
  messages[messages.length - 1].textContent = text;
}

// Ses tanıma ve mikrofon butonu işlemleri
const micBtn = document.getElementById("micBtn");
const userInput = document.getElementById("userInput");
const detailedAnalysisBtn = document.getElementById("detailedAnalysisBtn");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.addEventListener("click", () => {
    recognition.start();
    micBtn.textContent = "🎙️ Dinleniyor...";
    micBtn.classList.add("listening");
  });

  recognition.onresult = async (event) => {
    const speechResult = event.results[0][0].transcript;
    lastSpeechResult = speechResult;  // Son konuşmayı kaydet

    userInput.value = speechResult;
    micBtn.textContent = "🎤";
    micBtn.classList.remove("listening");

    addMessage("user", speechResult);
    addMessage("ai", "🧠 Değerlendiriliyor...");

    await evaluateSpokenText(speechResult);  // Sadece temel değerlendirme

    // Detaylı analiz butonunu aktif yap
    detailedAnalysisBtn.disabled = false;
  };

  recognition.onerror = (event) => {
    console.error("Ses tanıma hatası:", event.error);
    micBtn.textContent = "🎤";
    micBtn.classList.remove("listening");
  };

  recognition.onend = () => {
    micBtn.textContent = "🎤";
    micBtn.classList.remove("listening");
  };

} else {
  micBtn.disabled = true;
  micBtn.title = "Tarayıcınız konuşma tanımayı desteklemiyor.";
}

// Detaylı analiz butonu tıklama eventi
detailedAnalysisBtn.addEventListener("click", async () => {
  if (!lastSpeechResult) return;

  detailedAnalysisBtn.disabled = true;
  detailedAnalysisBtn.textContent = "Analiz yapılıyor...";

  await evaluateEnglishLevel(lastSpeechResult);
  await suggestCorrections(lastSpeechResult);

  detailedAnalysisBtn.textContent = "Detaylı Analiz Yap";
  detailedAnalysisBtn.disabled = false;
});
