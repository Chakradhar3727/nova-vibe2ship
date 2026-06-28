# NOVA: Neural Operations & Virtual Assistant 🚀
### VIBE2SHIP Hackathon Submission — *Problem 1: The Last-Minute Life Saver*

NOVA is not a passive productivity app or a simple to-do list; it is a **Tier 4 Autonomous AI Agent** that perceives, reasons, plans, executes, and reflects on behalf of the user to ensure deadlines are never missed.

## ✨ Core Features

*   **🧠 True Agentic Pipeline (ReAct):** Watch NOVA "think" in real-time. The UI exposes NOVA's internal monologue (Observe → Reason → Plan → Execute → Reflect) as it processes your requests and orchestrates tasks.
*   **🛠️ Gemini 2.5 Flash Tool Calling:** Powered by Google's Gemini API, NOVA doesn't just chat. It executes functions to interact with the world, schedule events, save memories, and compute math.
*   **🚨 Crisis Mode:** When overwhelmed, NOVA's Crisis Protocol takes over. It scans your Google Calendar, warns you of conflicts, and aggressively blocks out focus time to ensure you meet your most urgent deadline.
*   **🗓️ Google Calendar Integration:** Fully authenticated via Firebase OAuth2. NOVA reads your schedule and writes real events directly to your actual Google Calendar.
*   **🗣️ Multi-Language Voice Agent:** Speak to NOVA in English, Hindi, Telugu, Tamil, Bengali, or Marathi. Using native browser Speech-to-Text APIs, it captures your voice in real-time and executes tasks without typing a single word.
*   **🔔 Proactive Notification Engine:** A silent background worker polls your schedule. Exactly 5 minutes before a deadline, NOVA triggers a native system popup and a custom synthetic "ping" (generated via Web Audio API mathematics, no external MP3s).
*   **💻 Code Sandbox:** When calculating complex logic (like future timestamps), NOVA autonomously writes JavaScript code, deploys it to a secure Node.js `vm` sandbox, executes it, and uses the return value!
*   **🧠 Permanent Episodic Memory:** Tell NOVA a fact about yourself, and it uses vector embeddings (`gemini-embedding-2`) to store it permanently and recall it in future conversations.

## 🛠️ Technology Stack
*   **Framework:** Next.js 14 (App Router)
*   **Styling:** Tailwind CSS & Framer Motion (for hyper-smooth micro-animations)
*   **AI:** Google Gemini API (`gemini-2.5-flash`, `gemini-embedding-2`)
*   **Backend Services:** Firebase Authentication, Firestore Database
*   **APIs:** Google Calendar API, Web Speech API, Web Audio API, Notification API

## 🚀 Local Setup Instructions

1.  **Clone & Install**
    ```bash
    git clone <your-repo-link>
    cd vibe2hackthon/nova-app
    npm install
    ```

2.  **Environment Variables**
    Create a `.env.local` file in the root of `nova-app` and add your keys (see `.env.example`):
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
    ```

3.  **Run the Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏆 Hackathon Highlights
We focused heavily on the **Vibe & Polish**, creating a cinematic, hacker-style UI that makes you feel like you are interacting with a highly intelligent operating system. The integration of native APIs (Speech, Audio, Notifications) elevates this beyond a simple wrapper into a deeply integrated daily companion.

Built with ❤️ for the VIBE2SHIP Hackathon.
