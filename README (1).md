# Ember & Co

A voice-powered food delivery app — for customers and restaurant owners —
now set up as a real installable project instead of a single component
file. This README covers three ways to get it onto a phone or desktop,
roughly in order of effort.

## 0. Before anything else: the AI backend

The AI voice assistant calls `POST /api/chat`. A browser or installed app
can never safely hold a Anthropic API key (anyone could extract it), so
this project includes a **tiny backend proxy** in `/server` that holds the
key instead.

```bash
cd server
cp .env.example .env      # then paste your real ANTHROPIC_API_KEY into .env
npm install
npm start                  # runs on http://localhost:3001
```

Deploy that folder anywhere that runs Node — Render, Railway, Fly.io, a
VPS, etc. — and set `ANTHROPIC_API_KEY` as an environment variable there
(never commit it). Once deployed, point the app at it by setting
`VITE_CHAT_ENDPOINT` (see step 1) to that server's URL, e.g.
`https://your-backend.onrender.com/api/chat`.

Without this step, everything else in the app works fine — browsing,
cart, checkout, reviews, languages — except the AI assistant, which will
show a friendly error instead of a response.

## 1. Run it locally

```bash
npm install
npm run dev
```

This starts Vite's dev server (usually `http://localhost:5173`) and
proxies `/api/*` calls to `http://localhost:3001`, so run the backend
from step 0 alongside it.

To point at a deployed backend instead of localhost, create a `.env`
file in the project root:

```
VITE_CHAT_ENDPOINT=https://your-backend.onrender.com/api/chat
```

## 2. Installable app (Android, iPhone, and desktop) — easiest path

This project is already configured as a **PWA** (Progressive Web App)
via `vite-plugin-pwa`. Build it, host the `dist` folder on any static
host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, your own server —
anything serving static files over HTTPS), and:

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

Once it's hosted on a real HTTPS URL:

- **Android (Chrome):** open the site → menu (⋮) → "Add to Home screen" /
  "Install app". It installs like a native app, with its own icon and no
  browser chrome.
- **iPhone (Safari):** open the site → Share button → "Add to Home
  Screen."
- **Desktop (Chrome/Edge):** an install icon (⊕) appears in the address
  bar → "Install." It opens in its own window, appears in the Start
  Menu/Dock, etc.

No app store, no native build tooling, no signing certificates — and
mic/camera access (for voice ordering and photo uploads) works normally
since it's just a website using standard browser APIs, which is also
why it **needs to be served over HTTPS** (localhost is exempt, which is
why dev mode works without it).

This covers "Android and other phones, or desktop" for the vast
majority of real-world use. Reach for the options below only if you
specifically need it in the Google Play Store / Apple App Store, or a
double-clickable desktop installer.

## 3. Real native Android / iOS app (Play Store / App Store)

This uses [Capacitor](https://capacitorjs.com), which wraps the built
web app in a real native shell. You'll need Android Studio (for
Android) and/or Xcode on a Mac (for iOS) installed locally — those
can't be installed or run in this chat environment, so these are the
commands to run on your own machine:

```bash
npm install
npm run build
npx cap add android
npx cap add ios        # macOS + Xcode only
npx cap sync

npm run cap:android    # opens the project in Android Studio
npm run cap:ios        # opens the project in Xcode
```

From there, Android Studio / Xcode builds, signs, and runs the app on
a device or emulator, and is also how you'd produce the `.aab`/`.ipa`
files for store submission.

**Android permissions:** open
`android/app/src/main/AndroidManifest.xml` after `cap add android` and
make sure these are present (Capacitor adds internet access
automatically; the app's mic and camera features need these too):

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
```

Voice recognition quality inside a wrapped WebView can vary by device —
test on a real Android phone, not just an emulator.

## 4. Native desktop installer (optional)

The PWA in step 2 already installs on Windows/Mac/Linux desktops with
zero extra tooling. If you specifically want a traditional
double-clickable installer (`.exe`, `.dmg`, `.AppImage`) instead, a
minimal [Electron](https://www.electronjs.org) entry point is included
in `/electron/main.js`. To use it:

```bash
npm install --save-dev electron electron-builder
npm run build
npx electron electron/main.js   # run it directly
# or configure electron-builder in package.json to produce installers
```

This is genuinely optional — most projects only need step 2.

## Project structure

```
├── src/App.jsx        the app itself
├── src/main.jsx        React entry point
├── index.html
├── public/icons/       placeholder app icons — replace with real branding
├── server/             backend proxy that holds your Anthropic API key
├── electron/main.js    optional desktop wrapper
├── capacitor.config.json
└── vite.config.js      includes the PWA plugin config
```

## Notes carried over from the web version

- Payments (Card, JazzCash, Bank Transfer) and order notifications
  (email/SMS) are still simulated in the UI — wiring up real payment
  processing or email/SMS delivery requires their respective provider
  APIs (Stripe/JazzCash/Twilio/SendGrid, etc.) from a backend, for the
  same key-security reason as the AI assistant above.
- Restaurant/menu data lives in React state only — it resets on reload.
  A real deployment would need a database (Postgres, Firebase, etc.)
  behind the `/server` proxy.
