const apiKey = "AIzaSyCTS1UefFXgvzLL2T2UUflwYT4VDVN3jL8";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

// Cümleleri nokta ve virgüle göre ayır
function splitSentences(text) {
  return text.split(/[\.;]\s*/).filter(s => s.length > 0);
}



// Sayfadaki paragraf metnini al, cümleleri oluştur ve tıklanabilir yap
function setupClickableSentences() {
  const newsContent = document.querySelector('.news-content');
  if (!newsContent) return;

  // Paragraf içindeki tüm metni al
  let fullText = '';
  newsContent.querySelectorAll('p').forEach(p => {
    fullText += p.textContent + ' ';
  });

  const sentences = splitSentences(fullText);

  // Haber içeriğini temizleyip cümleleri span içine alalım
  newsContent.innerHTML = '';
  sentences.forEach(sentence => {
    const span = document.createElement('span');
    span.textContent = sentence.trim() + '. ';
    span.style.cursor = 'pointer';
    span.style.color = '#007bff';
    span.style.userSelect = 'none';
    span.addEventListener('click', () => {
      handleSentenceClick(sentence.trim());
    });
    newsContent.appendChild(span);
  });
}

// Cümle tıklanınca çağrılır
async function handleSentenceClick(sentence) {
  // Cümleyi çevir
  const turkishSentence = await translateSentence(sentence);
  document.getElementById('sentence-translation').textContent = turkishSentence;

  // Kelimeleri çevir
  const words = sentence.split(/\s+/).map(w => w.replace(/[.,;!?"']/g, '').toLowerCase()).filter(Boolean);
  const wordTranslations = await translateWords(words);

  const wordTranslationDiv = document.getElementById('word-translation');
  wordTranslationDiv.innerHTML = '';
  for (const [word, meaning] of Object.entries(wordTranslations)) {
    const div = document.createElement('div');
    div.textContent = `${word} : ${meaning}`;
    wordTranslationDiv.appendChild(div);
  }
}

// Gemini API ile cümle çevirisi
async function translateSentence(text) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `Lütfen aşağıdaki İngilizce cümleyi Türkçeye çevir:\n"${text}"` }]
          }
        ]
      })
    });
    const data = await res.json();
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
    return "Çeviri yapılamadı.";
  } catch (err) {
    console.error('Çeviri hatası:', err);
    return "Çeviri yapılamadı.";
  }
}

// Gemini API ile kelime kelime çeviri (her kelime için tek istek yerine bir kerede alabiliriz)
async function translateWords(words) {
  try {
    // Aynı anda kelimeleri virgül ile ayırarak gönderip karşılıklarını isteyelim
    const joinedWords = words.join(', ');
    const prompt = `Aşağıdaki İngilizce kelimelerin Türkçe anlamlarını listele. Format:\nkelime : anlam\n${joinedWords}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      // Gelen metni satırlara böl, her satırı 'kelime : anlam' olarak ayır
      const text = data.candidates[0].content.parts[0].text.trim();
      const lines = text.split('\n').filter(l => l.includes(':'));
      const dictionary = {};
      lines.forEach(line => {
        const [w, ...rest] = line.split(':');
        dictionary[w.trim()] = rest.join(':').trim();
      });
      return dictionary;
    }
    return {};
  } catch (err) {
    console.error('Kelime çeviri hatası:', err);
    return {};
  }
}

// Sayfa yüklendiğinde çalıştır
window.addEventListener('DOMContentLoaded', () => {
  setupClickableSentences();
});
