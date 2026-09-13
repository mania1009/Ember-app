// Minimal backend proxy for the Ember & Co AI voice assistant.
//
// WHY THIS EXISTS: browsers and mobile apps can't safely hold an
// Anthropic API key — anything shipped to a device can be extracted.
// This tiny server holds the key instead, and the app calls this
// server, which calls Anthropic on the app's behalf.
//
// Deploy this anywhere that runs Node (Render, Railway, Fly.io, a VPS,
// etc.), set ANTHROPIC_API_KEY in that host's environment variables,
// then point the app at it via VITE_CHAT_ENDPOINT (see README.md).

import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.post("/api/chat", async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set on the server." });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      // Forward the same {model, max_tokens, system, messages} body the app sends.
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to reach the Claude API." });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Ember & Co backend listening on port ${PORT}`));
