import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Load from ENV (Render)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// 🔥 Fix private key newline issue
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ---------------- ROUTES ----------------
app.post('/save-daily-min-max', async (req, res) => {
  const { date, min, max } = req.body;
  const year = date.split('-')[0];
  const month = `${year}-${date.split('-')[1]}`;

  try {
    await db.collection('Temperature History')
      .doc(year)
      .collection('records')
      .doc(date)
      .set({
        date,
        min,
        max,
        year,
        month,
        createdAt: new Date()
      });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));