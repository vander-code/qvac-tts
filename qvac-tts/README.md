# qvac-tts

A tiny text-to-speech tool that reads text out loud **entirely on your own
device** using [Tether's QVAC SDK](https://qvac.tether.io) — no cloud call,
no API key, no bill. Comes with two ways to use it:

- a command-line tool (`src/tts.js`) that saves a `.wav` file
- a simple web page (`server.js` + `public/index.html`) — type text, hear it
  played back instantly

Both call the same on-device speech function; the web page just gives it a
friendlier front end running on your own machine. Nothing is uploaded
anywhere.

It calls the QVAC SDK's `loadModel()` and `textToSpeech()` functions
directly.

## SDK version

Built and tested with `@qvac/sdk` **0.19.0**.

## Requirements

- [Node.js](https://nodejs.org) v22.17 or newer
- npm v10.9 or newer

## Install

```bash
git clone https://github.com/YOUR-USERNAME/qvac-tts.git
cd qvac-tts
npm install
```

## Run it — command line

```bash
node src/tts.js "Hello, this is on-device AI speaking"
```

First run downloads the TTS model and caches it locally. Every run after
that is fast. It saves the result to `output.wav` in the project folder —
double-click it to listen.

## Run it — web page

```bash
npm start
```

Then open **http://localhost:3000** in your browser, type any text, and
click **Speak on-device**. The audio plays right in the page.

## How it works

1. `loadModel()` loads a small text-to-speech model on-device.
2. `textToSpeech()` synthesizes the audio locally — nothing is sent to a
   server.
3. The raw audio samples are wrapped into a standard `.wav` file so any
   player (or the browser) can play it.
4. `unloadModel()` frees the model from memory when the run finishes.

All inference happens on-device via the QVAC SDK; no cloud AI service is
involved at any point.

## Troubleshooting

- **First run is slow** — that's the model downloading, not a bug.
- **Audio sounds sped up or slowed down** — open `src/run-tts.js` and try
  changing `SAMPLE_RATE` near the top (44100 ↔ 24000).
- **`loadModel` throws an error about the model name** — QVAC's TTS model
  names have changed across SDK versions. Check the current names in the
  [QVAC TTS docs](https://qvacdocs-rk0zz.kinsta.page/sdk/ai-tasks/text-to-speech)
  and update the import at the top of `src/run-tts.js` if needed.

## License

MIT — see [LICENSE](LICENSE).
