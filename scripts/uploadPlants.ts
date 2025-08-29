// scripts/uploadPlants.ts
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

async function uploadPlants() {
  try {
    const plantsDir = path.join(__dirname, "../data/plants");
    const files = fs.readdirSync(plantsDir);

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(plantsDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const plantData = JSON.parse(content);

        await setDoc(doc(db, "educational_plants", plantData.id), plantData, {
          merge: true,
        });

        console.log(`✅ Subida: ${plantData.name} (${plantData.id})`);
      }
    }

    console.log("🌱 Todas las plantas fueron subidas con éxito!");
  } catch (err) {
    console.error("❌ Error subiendo plantas:", err);
  }
}

uploadPlants();
