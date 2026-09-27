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

```
                    ┌───────────────────────────────────────────────┐
                    │            Browser Client (React SPA)          │
                    │   - Web Audio API (16kHz linear16 PCM Mic)    │
                    │   - 24kHz Live Audio Queue Player (Jitter Buf) │
                    │   - Screen & Document Canvas Streamer (1 FPS) │
                    │   - Interactive Clause Highlighter            │
                    │   - FNOL Claim Report Generator & Exporter    │
                    └───────┬───────────────────────────────▲───────┘
                            │                               │
             16kHz PCM Mic  │                               │ 24kHz PCM Audio
             1 FPS Video    │                               │ Turn Text / Events
                            ▼                               │
                    ┌───────────────────────────────────────┴───────┐
                    │        Full-Stack Express & WebSocket Server   │
                    │                   (server.ts)                 │
                    │   - WebSocket endpoint on /live               │
                    │   - POST /api/policy/analyze (Clause citation)│
                    │   - POST /api/gemini/tts (Flash Lite TTS)     │
                    │   - Vite Dev Middleware / Static Host         │
                    └───────┬───────────────────────────────▲───────┘
                            │                               │
               Bi-directional Live Connect (WebSocket)      │
                            ▼                               │
                    ┌───────────────────────────────────────┴───────┐
                    │               Google Gemini API               │
                    │   - gemini-3.1-flash-live-preview (Live Audio)│
                    │   - gemini-3-flash-preview (Adjudication, FNOL & TTS)│
                    └───────────────────────────────────────────────┘
```

### 1. Gemini Live API Integration (`/live`)
- **WebSocket Protocol**: Client streams microphone audio chunks encoded as raw 16-bit linear PCM (`audio/pcm;rate=16000`).
- **Screen Awareness**: Streams 1 FPS JPEG frames (`image/jpeg`) capturing the active policy document or the user's shared desktop window.
- **Low-Latency Spoken Response**: Gemini Live outputs raw 24kHz audio (`audio/pcm;rate=24000`), scheduled seamlessly via Web Audio API.
- **Mid-Response Barge-in**: When the caller interrupts, the server sends `{ type: 'interrupted' }`, immediately stopping playback and clearing audio queues.

### 2. Deep Clause Adjudication & FNOL (`/api/policy/analyze`)
- Analyzes caller statements against the policy contract using **gemini-3-flash-preview**.
- Extracts: Coverage verdict (`COVERED`, `PARTIALLY_COVERED`, `EXCLUDED`), cited clause, exact clause quote, applicable deductible, 2-to-3 sentence spoken explanation, action steps, and First Notice of Loss (FNOL) draft.

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
The server will start on `http://localhost:3000` with the Express backend, WebSocket server on `/live`, and Vite frontend mounted simultaneously.

### Step 5: Build for Production
```bash
npm run build
npm start
```

---

## 🌐 Deployment to Vercel / Cloud Platforms

### Deploying on Vercel
1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Add the Environment Variable in Vercel settings:
   - Key: `GEMINI_API_KEY`
   - Value: `your-gemini-api-key`
5. Click **Deploy**. Vercel will build the frontend via `npm run build`.

*(For full WebSocket Live audio streaming in production environments, deploy to Google Cloud Run, Railway, or Render where stateful WebSocket connections are fully sustained).*

---

## 📋 Submission Checklist (Network Science Brief)

- [x] **Project Selected**: Project Idea 2 (Live Policy and Claims Voice Assistant BFSI / Insurance)
- [x] **Real-Time Gemini Live API**: Live audio conversation (`gemini-3.1-flash-live-preview`) with 16kHz PCM streaming and 24kHz playback
- [x] **Live Screen & Document Awareness**: 1 FPS frame streaming allowing Gemini to visually inspect policy clauses on screen
- [x] **Mid-Response Interruption (Barge-In)**: Immediate audio flush when caller speaks
- [x] **Clause Grounding**: Direct citation of clauses and deductibles with no walls of text
- [x] **NSOffice Glass UI System**: Electric Blue (`#0066FF`), DM Sans font, Apple-style spacing, one primary action per view
- [x] **First Notice of Loss (FNOL)**: Formal claims intake document export and printable report
- [x] **API Key Security**: Stored in environment variable (`GEMINI_API_KEY`), `.env` added to `.gitignore`

---

*Developed for Network Science (NSOffice.AI) AI Centre of Excellence Assignment.*
