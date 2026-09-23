// run-tts.js — the actual on-device text-to-speech call, shared by the CLI
// (src/tts.js) and the web server (server.js), so there's only one place
// that talks to the QVAC SDK.

import { loadModel, textToSpeech, unloadModel, TTS_MINI_V1_EN_PARLER_TTS_Q8_0 } from "@qvac/sdk";

// Parler-TTS Mini's native sample rate. If the generated audio sounds
// sped-up or slowed-down, try 24000 instead — see README troubleshooting.
const SAMPLE_RATE = 44100;

/**
 * Speaks `text` entirely on-device and returns a ready-to-play WAV file.
 * @param {string} text
 * @param {(msg: string) => void} [onStatus] - optional progress callback.
 * @returns {Promise<Buffer>} a WAV audio file as a Buffer.
 */
export async function speak(text, onStatus = () => {}) {
  onStatus("Loading TTS model on-device (first run downloads it)...");

  const modelId = await loadModel({
    modelSrc: TTS_MINI_V1_EN_PARLER_TTS_Q8_0,
    modelType: "tts",
    modelConfig: {
      ttsEngine: "parler",
      voice: "Laura",
    },
  });

  onStatus("Model loaded. Generating speech on-device...");

  try {
    const result = textToSpeech({
      modelId,
      text,
      inputType: "text",
      stream: false,
    });

    const samples = await result.buffer; // array of 16-bit PCM samples
    return pcm16ToWav(samples, SAMPLE_RATE);
  } finally {
    await unloadModel({ modelId });
  }
}

/** Wraps raw 16-bit mono PCM samples in a standard WAV file header. */
function pcm16ToWav(samples, sampleRate) {
  const bytesPerSample = 2;
  const numChannels = 1;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;

  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }

  return buffer;
}
