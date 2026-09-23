// server.js — a tiny local web server that gives the TTS tool a simple
// "type text, hear it" interface. The browser only sends the text and
// plays the resulting audio; the actual speech synthesis still runs
// on-device via the QVAC SDK, right here on your own machine.

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { speak } from "./src/run-tts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/tts", async (req, res) => {
  const text = (req.body?.text || "").trim();
  if (!text) {
    return res.status(400).json({ error: "No text provided." });
  }

  try {
    const wav = await speak(text);
    res.set("Content-Type", "audio/wav");
    res.send(wav);
  } catch (error) {
    console.error("TTS failed:", error);
    res.status(500).json({ error: String(error.message || error) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\nqvac-tts running at http://localhost:${PORT}`);
  console.log("Open that link in your browser. All speech is generated on-device.\n");
});
