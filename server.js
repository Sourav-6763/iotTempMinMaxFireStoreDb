import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ ADD THIS (VERY IMPORTANT)
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ NOW THIS WORKS
const db = admin.firestore();

app.post('/save-daily-min-max', async (req, res) => {
  const { date, min, max } = req.body;
  const year = date.split('-')[0];
  const addonMonth=date.split('-')[1];
  const month=`${year}-${addonMonth}`;
  console.log(month);

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

    return res.status(200).json({
      success: true,
      message: "Data saved successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
});

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

const PORT=process.env.PORT||5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});