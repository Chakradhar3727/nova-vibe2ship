# 🌌 NOVA (Neural Operations & Virtual Assistant)

NOVA is a proactive, autonomous AI productivity agent built for high-stakes, deadline-driven environments. Unlike traditional chatbots that wait for your command, NOVA actively monitors your schedule, reasons about your time constraints, and executes real actions on your Google Calendar to prevent you from failing.

Built during a weekend hackathon, NOVA bridges the gap between passive AI chat and active AI agency.

## ✨ Core Features

*   **🧠 Live Agent Reasoning Loop:** Watch NOVA's thought process in real-time as it cycles through the **Observe → Reason → Plan → Execute → Reflect** framework.
*   **📅 Autonomous Execution:** NOVA doesn't just suggest a schedule—it securely connects to your Google Calendar API and actively creates time blocks, reminders, and events on your behalf.
*   **🚨 Crisis Protocol:** When overwhelmed, one click triggers "Crisis Mode." NOVA analyzes your calendar fragmentation, finds a clean chronological path, and forcefully drops a 2.5-hour "DO NOT DISTURB" block into your real schedule to save your deadlines.
*   **🔔 Proactive Background Engine:** NOVA polls your upcoming Google Calendar events in the background and will trigger a custom synth audio alert exactly 5 minutes before your next meeting.
*   **🧬 Episodic Memory:** NOVA leverages local vector embeddings to permanently remember important facts and preferences you mention during conversations.

## 🛠️ Tech Stack

*   **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion
*   **AI Engine:** Google Gemini 2.5 Flash (Function Calling, Embeddings, Dynamic System Prompting)
*   **Authentication & Database:** Firebase Auth, Firestore
*   **Integrations:** Google Calendar API (OAuth 2.0)
*   **State Management:** Zustand

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Chakradhar3727/nova-vibe2ship.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (Firebase, Gemini API, Google Calendar OAuth).
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎨 UI / UX Design

NOVA is built with a premium, aesthetic interface featuring glassmorphism, dynamic glowing gradients, micro-animations, and a highly polished dark mode. The UI is designed to feel like a futuristic Command Center, inspiring focus and clarity.
