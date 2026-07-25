# InterVue AI

Adaptive AI interview simulator. Rebuilt from the original single-file
prototype into a real client/server app.

## Architecture

```
client/   React + Vite + Tailwind + Framer Motion
server/   Node + Express — owns the Gemini API key and all interview logic
```

The client never talks to Gemini directly. It calls the Express server,
which holds the conversation state per interview session and calls
Gemini with the full context each time. This keeps your API key off the
client and lets the server enforce the adaptive logic (difficulty
changes, teaching mode, follow-ups) consistently.

```
Client                      Server                        Gemini
------                      ------                        ------
POST /api/interview/start   creates session, first Q   →   generates opening question
POST /api/interview/answer  sends latest answer         →   classifies + decides next step
                             + full transcript so far
                          ←  { verdict, nextAction,
                               message, teach? }
```

## Audit status (full technical audit, this pass)

- [x] **Gemini SDK/model** — `@google/generative-ai` (fully deprecated)
      and `gemini-1.5-flash` (fully shut down, 404s) replaced with
      `@google/genai` and `gemini-3.5-flash` (current GA model, no
      shutdown date as of July 2026 — confirmed via Google's own
      deprecation docs, not assumed). `response.text` is now a property,
      not `.text()` — that silent breakage is fixed too. Verified: server
      genuinely attempts a live call and gets a structured, correct error
      shape back (blocked only by this sandbox's network allowlist, not
      by anything in the app).
- [x] **Real adaptive conversation** — 8-12 technical questions
      (scaled by difficulty) plus 2 intro questions, with follow-ups,
      teach-then-easier flow, and topic memory — targets roughly
      10-15 minutes including teaching detours.
- [x] **Avatar** — illustrated head-and-shoulders SVG bust (your choice,
      not a paid video-avatar service): independent blink timer, continuous
      idle sway, eyebrow lift when teaching, mouth driven by real TTS
      word-boundary events (not decorative). A real bug (Framer Motion
      animating from `undefined` on the eyes/mouth) was caught by the
      automated test run and fixed.
- [x] **Two-panel layout** — interviewer left, candidate webcam right,
      both requested up front. Found and fixed a real bug: the webcam
      stream was being killed when the permissions screen unmounted,
      so it would've gone dark right as the interview started. Stream is
      now lifted to the app root and stays alive for the whole session.
- [x] **Watch Demo** — fully scripted interview (intro, follow-up,
      a struggle-then-teach moment, wrap-up, sample report), using real
      TTS and the real Avatar/TeachingPanel/ReportCard components, not a
      video or static mockup. Verified end-to-end with an automated test,
      including the mid-playback exit button.
- [x] **Every button/interaction** — swept the whole client for buttons
      with no handler; none found. Nav anchors, all CTAs, demo exit,
      report download, all form controls confirmed wired.
- [x] **Resume upload** — swapped `pdf-parse` for `pdfjs-dist` after
      directly proving (not assuming) that `pdf-parse` fails on real
      files including ones jsPDF itself generates; fixed a duplicate-key
      bug in package.json and a missing-font-data warning along the way.
      Tested PDF/DOCX/TXT/unsupported-type through the actual HTTP route
      with real generated files, and confirmed the summary reaches the
      Gemini system prompt.
- [x] **Automated end-to-end testing** — added vitest + jsdom +
      Testing Library with realistic mocks for getUserMedia,
      SpeechRecognition, and speechSynthesis. 9 tests click through the
      actual React app (not the server) covering: full interview
      landing→setup→permissions→interview→report, the Gemini-failure
      error path, the full Watch Demo script, resume upload (success,
      client-side rejection, server-failure-doesn't-block), and teaching-
      concept matching for all 12 built visuals plus the fallback. All
      9 pass. This is real browser-API-level testing, short of an actual
      browser — see limits below.
- [x] Production build verified clean after every change in this pass,
      not just once at the end.

## What I could NOT verify from this sandbox

Being direct about the limits, not glossing over them:

1. **Live Gemini responses** — this sandbox's network is blocked from
   `generativelanguage.googleapis.com`. Every code path that depends on
   it (question generation, scoring) is verified to be *correctly built
   and to fail gracefully*, but the actual quality/behavior of live
   responses needs testing by you, locally, with a real key.
2. **Real microphone/camera/speaker hardware** — jsdom mocks satisfy
   the code paths but can't confirm real STT accuracy, TTS voice quality,
   or camera framing. Needs a real browser.
3. **Visual/animation polish** — the avatar, teaching diagrams, and
   layout are correct in code and render without errors in tests, but I
   can't see them, so a visual pass by you is worth doing.

## Setup

```bash
# server
cd server
cp .env.example .env   # add your GEMINI_API_KEY
npm install
npm run dev             # http://localhost:4000

# client (separate terminal)
cd client
npm install
npm run dev              # http://localhost:5173, proxies /api to server
npm test                 # runs the automated test suite described above
```
