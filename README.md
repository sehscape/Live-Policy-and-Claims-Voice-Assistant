# Live Policy and Claims Voice Assistant (BFSI / Insurance)
### NSOffice.AI — AI Centre of Excellence Internship Assignment
**Selected Project:** **Idea 2 — Live Policy and Claims Voice Assistant**

---

## 🌟 Executive Summary

The **Live Policy and Claims Voice Assistant** is an end-to-end real-time conversational insurance application built with the **Google Gemini Live API**. 

Instead of forcing callers to read dense multi-page insurance policy documents or endure rigid phone trees, this assistant:
1. **Listens in real time** via a low-latency bidirectional audio WebSocket connection (`gemini-3.1-flash-live-preview`).
2. **Watches the shared screen or document canvas** at 1 FPS, maintaining visual awareness of policy terms, declaration schedules, and damage evidence.
3. **Grounds answers strictly in actual policy clauses**, highlighting the exact clause in the interactive document viewer in real-time.
4. **Speaks back clear, reassuring explanations** in plain speech without insurance jargon or walls of text.
5. **Handles interruptions mid-sentence (barge-in)** naturally, stopping playback immediately when the caller speaks.
6. **Generates structured First Notice of Loss (FNOL) claim notices** with deductible amounts, coverage verdicts, and immediate action checklists.

---

## 🎨 NSOffice Glass UI System Implementation

The application strictly implements the **NSOffice Glass UI system**:
- **Electric Blue Accent Color:** `#0066FF` with luminous glow effects (`box-shadow: 0 0 25px rgba(0, 102, 255, 0.45)`).
- **DM Sans Typeface:** Google Font `DM Sans` throughout all headings and body copy for crisp readability.
- **Apple-Style Spacing & Visual Hierarchy:** Generous breathing room, subtle inner borders, translucent frosted glass cards (`backdrop-blur-2xl`), and **one primary action per view** (e.g. *Start Live Voice Call*).
- **Active Real-Time Waveform:** Reactive 16-band audio visualizer synchronized to caller microphone input and assistant speech playback.

---

## 🛡️ Supported Insurance Policies & Scenarios

The assistant comes pre-loaded with comprehensive, authentic insurance policy contracts and sample caller inquiries:

1. **AutoShield Gold — Personal Auto Policy (PAP-2026-GOLD)**:
   - *Animal Strike vs. Collision*: Clarifies that hitting a deer is classified as Comprehensive under **Clause 1.2(c)** ($250 deductible, not $500 collision, and safe-driver discount is preserved).
   - *Hit-and-Run in Parking Lot*: Details 24-hour police report requirements under **Clause 4.2**.
   - *Rental Car Reimbursement*: Up to $50/day for 30 days under **Clause 3.1** while undergoing active repair.
   - *Safety Glass & Windshield*: $0 deductible for chip repair under **Clause 1.2(d)**.

2. **HomeGuard Platinum — All-Risk Homeowners Policy (HO-3-PLATINUM)**:
   - *Sudden Pipe Burst*: Water damage from burst copper plumbing pipe covered under **Clause 3.2(a)** ($1,000 deductible; includes tear-out costs to access pipe).
   - *Sewer & Drain Backup*: Covered up to $10,000 under the attached **Clause 3.5 Endorsement** with a $500 endorsement deductible.
   - *Fallen Tree on Roof*: Roof repairs covered under Dwelling A, plus $1,500 tree debris removal under **Clause 4.1**.

3. **MediShield Premier — PPO Gold Healthcare Plan (HLTH-PPO-2026)**:
   - *Emergency Room Out-of-State*: Federal No Surprises Act and **Clause 2.1** guarantee emergency care at in-network rates without prior authorization.
   - *Specialist Access*: Direct access without PCP referral under **Clause 6.2** with a $40 copay.

4. **GlobalTraveler Elite — Worldwide Travel Protection (TRV-WORLD-2026)**:
   - *Flight Disruption*: 4+ hour delays qualify for up to $250/day for hotel and meals under **Clause 2.1**.
   - *Emergency Dental Relief Abroad*: Up to $1,500 for acute dental pain under **Clause 4.5** ($50 deductible).

5. **Custom Policy Uploader**:
   - Upload any company or personal policy document (`.txt`, `.pdf`, `.json`, `.md`) for instant live clause adjudication and spoken grounding!

---

## 🏗️ Technical Architecture

The app is built to run on **Vercel's serverless platform**, which cannot host a persistent WebSocket relay. So instead of proxying live audio through our own backend, the **browser connects directly to Google's Gemini Live WebSocket**, authenticated with a short-lived, single-use token minted by a serverless function. `GEMINI_API_KEY` itself never reaches the browser.

```
                    ┌───────────────────────────────────────────────┐
                    │            Browser Client (React SPA)          │
                    │   - Web Audio API (16kHz linear16 PCM Mic)    │
                    │   - 24kHz Live Audio Queue Player (Jitter Buf) │
                    │   - Screen & Document Canvas Streamer (1 FPS) │
                    │   - Interactive Clause Highlighter            │
                    │   - FNOL Claim Report Generator & Exporter    │
                    └──────┬───────────────────────────┬───▲────────┘
                            │                           │   │
        POST /api/live-token│           Direct Live Connect (WebSocket)
        POST /api/policy/*  │                           │   │
                            ▼                           ▼   │
                    ┌───────────────────┐       ┌───────────┴─────────┐
                    │ Vercel Serverless  │       │   Google Gemini API │
                    │ Functions (api/*)  │       │ gemini-3.1-flash-   │
                    │ - live-token.ts    │       │  live-preview (Live)│
                    │ - policy/analyze.ts│──────▶│ gemini-3-flash-     │
                    └───────────────────┘        │  preview (Text)     │
                                                  └──────────────────────┘
```

### 1. Gemini Live API Integration (direct browser connection)
- The browser calls `POST /api/live-token` (a Vercel serverless function) which mints a short-lived, single-use ephemeral token via `ai.authTokens.create(...)`, so the real API key never leaves the server.
- The browser then opens `ai.live.connect(...)` directly to Google using that token, streaming microphone audio (`audio/pcm;rate=16000`) and 1 FPS JPEG frames (`image/jpeg`) of the shared screen or document canvas.
- **Low-Latency Spoken Response**: Gemini Live outputs raw 24kHz audio (`audio/pcm;rate=24000`), scheduled seamlessly via Web Audio API.
- **Mid-Response Barge-in**: When the caller interrupts, `serverContent.interrupted` is delivered straight to the browser's `onmessage` callback, which immediately flushes the audio queue.
- `server.ts` (used only for local development via `npm run dev`) exposes the same `/api/live-token` route through Express so local behavior matches production exactly.

### 2. Deep Clause Adjudication & FNOL (`/api/policy/analyze`)
- Analyzes caller statements against the policy contract using **gemini-3-flash-preview**.
- Extracts: Coverage verdict (`COVERED`, `PARTIALLY_COVERED`, `EXCLUDED`), cited clause, exact clause quote, applicable deductible, 2-to-3 sentence spoken explanation, action steps, and First Notice of Loss (FNOL) draft.
- Implemented once in `api/_shared/gemini.ts` and reused by both the Vercel function (`api/policy/analyze.ts`) and the local Express server (`server.ts`), so the two never drift apart.

### 3. "Listen" Replay for Typed Queries
- When a caller types a question instead of speaking (or wants to re-hear an answer), the spoken explanation is replayed via the browser's native `SpeechSynthesis` API, not a Gemini call. Gemini's two brief-approved models are `gemini-3.1-flash-live-preview` (audio-to-audio, used only inside an active live call) and `gemini-3-flash-preview` (text-only, no audio output) — there is no compliant Gemini model for standalone text-to-speech outside a live session.

---

## 🚀 Setup & Local Execution

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**
- **Gemini API Key**: Free tier from [Google AI Studio](https://aistudio.google.com/)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/live-policy-voice-assistant.git
cd live-policy-voice-assistant
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and set your Gemini API key:
```env
# GEMINI_API_KEY: Required for Gemini AI API and Live WebSocket calls
GEMINI_API_KEY="your-gemini-api-key-here"

# APP_URL: Optional for local development
APP_URL="http://localhost:3000"
```
*(Note: `.env` is listed in `.gitignore` and is never committed to Git).*

### Step 4: Run the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` with the Express backend (serving `/api/live-token` and `/api/policy/analyze`) and the Vite frontend mounted simultaneously. The browser connects directly to Gemini's Live API using a token from `/api/live-token`, the same way it does in production on Vercel.

### Step 5: Build for Production
```bash
npm run build
npm start
```

---

## 🌐 Deployment to Vercel

1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository. Vercel auto-detects the Vite framework preset (build command `vite build`, output directory `dist`) and picks up the `api/` folder as serverless functions automatically.
4. Add the Environment Variable in Vercel settings:
   - Key: `GEMINI_API_KEY`
   - Value: `your-gemini-api-key`
5. Click **Deploy**.
6. If the deployment URL redirects to a Vercel login page, go to **Project Settings → Deployment Protection** and disable it (or use the Production domain instead of a preview-deployment link) so the public link is reachable without a Vercel account.

Because the browser connects directly to Gemini's Live API using a short-lived token (see Technical Architecture above), the full real-time voice and screen-aware experience — not just the static UI — works on Vercel's serverless functions with no separate always-on server required.

---

## 📋 Submission Checklist (Network Science Brief)

- [x] **Project Selected**: Project Idea 2 (Live Policy and Claims Voice Assistant BFSI / Insurance)
- [x] **Real-Time Gemini Live API**: Live audio conversation (`gemini-3.1-flash-live-preview`) with 16kHz PCM streaming and 24kHz playback, connected directly from the browser so it works on Vercel's serverless functions
- [x] **Live Screen & Document Awareness**: 1 FPS frame streaming allowing Gemini to visually inspect policy clauses on screen
- [x] **Mid-Response Interruption (Barge-In)**: Immediate audio flush when caller speaks
- [x] **Clause Grounding**: Direct citation of clauses and deductibles with no walls of text (`gemini-3-flash-preview`)
- [x] **NSOffice Glass UI System**: Electric Blue (`#0066FF`), DM Sans font, Apple-style spacing, one primary action per view
- [x] **First Notice of Loss (FNOL)**: Formal claims intake document export and printable report
- [x] **API Key Security**: `GEMINI_API_KEY` only ever read server-side (`api/_shared/gemini.ts`); the browser only ever receives a short-lived, single-use ephemeral Live token, never the real key. `.env` is in `.gitignore`.
- [x] **Public GitHub Repository**: pushed
- [x] **Vercel Deployment**: live, public link (Deployment Protection disabled)

---

*Developed for Network Science (NSOffice.AI) AI Centre of Excellence Assignment.*
