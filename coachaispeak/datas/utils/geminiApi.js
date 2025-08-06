const apiKey = "AIzaSyCTS1UefFXgvzLL2T2UUflwYT4VDVN3jL8"; // 🔐 Buraya kendi key'ini yaz

async function getGeminiResponse(prompt) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
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
    console.log("🌐 GEMINI FLASH RESPONSE:", data);

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else if (data?.error) {
      console.error("❌ Gemini API error:", data.error);
      return "API hatası: " + data.error.message;
    } else {
      return "Yanıt alınamadı.";
    }
  } catch (err) {
    console.error("❌ FETCH ERROR:", err);
    return "Bağlantı hatası oluştu.";
  }
}
