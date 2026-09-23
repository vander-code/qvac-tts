// qvac-tts — a tiny CLI that turns text into spoken audio entirely
// on-device using Tether's QVAC SDK. No cloud call, no API key, no bill.
//
// Usage:
//   node src/tts.js "Hello, this is on-device AI"

import { writeFileSync } from "node:fs";
import { speak } from "./run-tts.js";

const text = process.argv.slice(2).join(" ");

if (!text.trim()) {
  console.error('Usage: node src/tts.js "Text to speak"');
  process.exit(1);
}

try {
  const wav = await speak(text, (msg) => console.log(msg));
  writeFileSync("output.wav", wav);
  console.log("\n✅ Saved to output.wav — open it with any audio player.");
} catch (error) {
  console.error("\n❌ Text-to-speech failed:", error);
  process.exit(1);
}
