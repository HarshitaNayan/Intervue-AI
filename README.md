# 🎤 InterVue AI:-

An adaptive AI interview simulator for students and software engineers practicing technical interviews.✨

## 💡 What it does:-
- 🗣️ Conducts a realistic voice-based technical interview (6-10 questions, ~10-15 minutes) with an animated AI interviewer
- 🎯 Adapts question difficulty and follow-ups based on how you actually answer
- 📄 Optionally reads your resume to personalize questions to your background
- 🧠 Explains concepts on the spot in "teaching mode" when you're unsure
- 📊 Generates a scored performance report at the end

## 🛠️ Tech stack:-
- Client: React + Vite + Tailwind CSS + Framer Motion
- Server: Node.js + Express
- AI: Google Gemini API
- 🎙️ Web Speech API for voice input/output

## 🔑 Bring Your Own Key (BYOK):-
Each visitor enters their own free Gemini API key in the browser. The key is stored only in that browser and never saved on the server. Get a free key at aistudio.google.com/apikey.

## 🚀 Running locally:-

**Server** (in one terminal):

cd server

npm install

npm run dev

**Client** (in a separate terminal):

cd client

npm install

npm run dev

🔗 **Live demo:** https://intervue-ai-85b1.onrender.com

## 🌐 Browser Support:-

Voice input works best on Chrome or Edge (tested on Android). If your browser doesn't support voice input, typing your answers works everywhere as a seamless fallback.
