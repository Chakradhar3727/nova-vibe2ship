// Agent State Machine — THE MOAT
// This is the core differentiator: visible agentic intelligence
import { create } from 'zustand';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Agent states with their metadata
export type AgentStateType = 'IDLE' | 'OBSERVE' | 'REASON' | 'PLAN' | 'EXECUTE' | 'REFLECT' | 'CRISIS' | 'BACKGROUND';

export interface AgentStateInfo {
  state: AgentStateType;
  color: string;
  bgColor: string;
  icon: string;
  label: string;
  description: string;
}

export const AGENT_STATES: Record<AgentStateType, AgentStateInfo> = {
  IDLE: {
    state: 'IDLE',
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.15)',
    icon: '⏸️',
    label: 'Idle',
    description: 'Ready to assist',
  },
  OBSERVE: {
    state: 'OBSERVE',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: '👁️',
    label: 'Observing',
    description: 'Analyzing your input...',
  },
  REASON: {
    state: 'REASON',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: '🧠',
    label: 'Reasoning',
    description: 'Processing context and constraints...',
  },
  PLAN: {
    state: 'PLAN',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    icon: '📋',
    label: 'Planning',
    description: 'Creating an optimized strategy...',
  },
  EXECUTE: {
    state: 'EXECUTE',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: '⚡',
    label: 'Executing',
    description: 'Taking autonomous actions...',
  },
  REFLECT: {
    state: 'REFLECT',
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    icon: '🔄',
    label: 'Reflecting',
    description: 'Evaluating outcomes and learning...',
  },
  CRISIS: {
    state: 'CRISIS',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: '🚨',
    label: 'Crisis Mode',
    description: 'Emergency intervention active!',
  },
  BACKGROUND: {
    state: 'BACKGROUND',
    color: '#14B8A6',
    bgColor: 'rgba(20, 184, 166, 0.15)',
    icon: '🔄',
    label: 'Background Task',
    description: 'Proactively executing scheduled events...',
  },
};

// Reasoning log entry
export interface ReasoningLogEntry {
  id: string;
  timestamp: Date;
  state: AgentStateType;
  message: string;
}

// Autonomy levels
export type AutonomyLevel = 'suggest' | 'plan' | 'execute';

export interface AutonomyLevelInfo {
  level: AutonomyLevel;
  label: string;
  description: string;
  icon: string;
}

export const AUTONOMY_LEVELS: Record<AutonomyLevel, AutonomyLevelInfo> = {
  suggest: {
    level: 'suggest',
    label: 'Suggest',
    description: 'NOVA suggests actions and waits for your approval on each step',
    icon: '💡',
  },
  plan: {
    level: 'plan',
    label: 'Plan',
    description: 'NOVA creates a full plan and asks for one-time approval to execute',
    icon: '📋',
  },
  execute: {
    level: 'execute',
    label: 'Execute',
    description: 'NOVA acts autonomously — creates events, sends reminders, schedules tasks',
    icon: '⚡',
  },
};

// Chat message type
export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date | string;
  agentState?: AgentStateType;
  actions?: Array<{
    label: string;
    type: string;
    data?: Record<string, unknown>;
  }>;
}

export type BackgroundTask = {
  id: string;
  instruction: string;
  executeAt: number;
  completed: boolean;
};

// Main store interface
interface AgentStore {
  // Agent State
  currentState: AgentStateType;
  stateHistory: AgentStateType[];
  reasoningLog: ReasoningLogEntry[];
  confidence: number;
  currentAction: string;

  // Autonomy
  autonomyLevel: AutonomyLevel;

  // Chat
  messages: ChatMessage[];
  isProcessing: boolean;

  // Demo mode
  isDemoMode: boolean;
  isCrisisMode: boolean;

  // Background Tasks
  backgroundTasks: BackgroundTask[];

  // Actions
  setState: (state: AgentStateType) => void;
  addReasoningLog: (state: AgentStateType, message: string) => void;
  setAutonomyLevel: (level: AutonomyLevel) => void;
  addMessage: (message: ChatMessage) => void;
  setProcessing: (processing: boolean) => void;
  setConfidence: (confidence: number) => void;
  setCurrentAction: (action: string) => void;
  setDemoMode: (demo: boolean) => void;
  setCrisisMode: (crisis: boolean) => void;
  
  scheduleTask: (instruction: string, delayMs: number) => void;
  markTaskCompleted: (taskId: string) => void;

  runStateTransition: (states: AgentStateType[], messages: string[], delayMs?: number) => Promise<void>;
  resetChat: () => void;
  clearLocalChat: () => void;
  initializeStore: () => Promise<void>;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  // Initial state
  currentState: 'IDLE',
  stateHistory: [],
  reasoningLog: [],
  confidence: 0,
  currentAction: '',

  autonomyLevel: 'execute',

  messages: [],
  isProcessing: false,

  isDemoMode: false,
  isCrisisMode: false,

  backgroundTasks: [],

  // Set agent state
  setState: (state) =>
    set((prev) => ({
      currentState: state,
      stateHistory: [...prev.stateHistory, state],
    })),

  // Add to reasoning log
  addReasoningLog: (state, message) =>
    set((prev) => ({
      reasoningLog: [
        ...prev.reasoningLog,
        {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          timestamp: new Date(),
          state,
          message,
        },
      ],
    })),

  // Set autonomy level
  setAutonomyLevel: (level) => set({ autonomyLevel: level }),

  // Add chat message
  addMessage: async (message) => {
    set((prev) => ({
      messages: [...prev.messages, message],
    }));
    
    // Sync to Firestore
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const currentMessages = userDoc.exists() ? userDoc.data().messages || [] : [];
        await setDoc(userRef, { messages: [...currentMessages, message] }, { merge: true });
      } catch (error) {
        console.error('Error syncing message to Firestore:', error);
      }
    }
  },

  // Set processing state
  setProcessing: (processing) => set({ isProcessing: processing }),

  // Set confidence
  setConfidence: (confidence) => set({ confidence }),

  // Set current action
  setCurrentAction: (action) => set({ currentAction: action }),

  // Set demo mode
  setDemoMode: (demo) => set({ isDemoMode: demo }),

  // Set crisis mode
  setCrisisMode: (crisis) => set({ isCrisisMode: crisis }),

  // Background Task scheduling
  scheduleTask: (instruction, delayMs) => set((prev) => {
    const newTask: BackgroundTask = {
      id: `task-${Date.now()}`,
      instruction,
      executeAt: Date.now() + delayMs,
      completed: false,
    };
    return { backgroundTasks: [...prev.backgroundTasks, newTask] };
  }),

  markTaskCompleted: (taskId) => set((prev) => ({
    backgroundTasks: prev.backgroundTasks.map(t => 
      t.id === taskId ? { ...t, completed: true } : t
    )
  })),

  // Run through state transitions with delays (THE MOAT - visible thinking)
  runStateTransition: async (states, messages, delayMs = 800) => {
    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      const message = messages[i] || `${state}...`;

      get().setState(state);
      get().addReasoningLog(state, message);
      get().setCurrentAction(message);
      get().setConfidence(Math.min(20 + ((i + 1) / states.length) * 80, 98));

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  },

  // Reset chat completely (local + firestore)
  resetChat: async () => {
    get().clearLocalChat();
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { messages: [] }, { merge: true });
      } catch (error) {
        console.error('Error resetting chat in Firestore:', error);
      }
    }
  },

  // Clear local chat state (used on logout/switch account)
  clearLocalChat: () => {
    set({
      messages: [],
      reasoningLog: [],
      stateHistory: [],
      currentState: 'IDLE',
      confidence: 0,
      currentAction: '',
      isCrisisMode: false,
    });
  },

  // Initialize store from Firestore
  initializeStore: async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists() && userDoc.data().messages) {
          set({ messages: userDoc.data().messages });
        }
      } catch (error) {
        console.error('Error initializing store from Firestore:', error);
      }
    }
  },
}));
