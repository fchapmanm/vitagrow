// scripts/uploadLearn.ts
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

// Cargar variables de entorno
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadLearnArticles() {
  try {
    const learnDataPath = path.join(__dirname, "../data/learn/learn.json");
    const content = fs.readFileSync(learnDataPath, "utf-8");
    const learnData = JSON.parse(content);

    for (const article of learnData) {
      await setDoc(doc(db, "learn", article.id), article, {
        merge: true,
      });

      console.log(`✅ Subida: ${article.title} (${article.id})`);
    }

    console.log("📚 Todos los artículos fueron subidos con éxito!");
  } catch (err) {
    console.error("❌ Error subiendo artículos:", err);
  }
}

uploadLearnArticles();
