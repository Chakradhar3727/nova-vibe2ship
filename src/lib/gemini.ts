// Gemini API client wrapper with function calling
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Function declarations for Gemini Function Calling
export const functionDeclarations: any = [
  {
    name: 'create_calendar_event',
    description: 'Create a new calendar event for a task or deadline',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: 'Event title' },
        description: { type: SchemaType.STRING, description: 'Event description' },
        startTime: { type: SchemaType.STRING, description: 'Start time in ISO 8601 format' },
        endTime: { type: SchemaType.STRING, description: 'End time in ISO 8601 format' },
        priority: { type: SchemaType.STRING, description: 'Priority level: high, medium, low' },
      },
      required: ['title', 'startTime', 'endTime'],
    },
  },
  {
    name: 'create_task',
    description: 'Create a new task with deadline and priority',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: 'Task title' },
        description: { type: SchemaType.STRING, description: 'Task description' },
        deadline: { type: SchemaType.STRING, description: 'Deadline in ISO 8601 format' },
        priority: { type: SchemaType.STRING, description: 'Priority: critical, high, medium, low' },
        estimatedMinutes: { type: SchemaType.NUMBER, description: 'Estimated time in minutes' },
      },
      required: ['title', 'deadline', 'priority'],
    },
  },
  {
    name: 'send_nudge',
    description: 'Send a proactive nudge/reminder to the user',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        message: { type: SchemaType.STRING, description: 'Nudge message' },
        urgency: { type: SchemaType.STRING, description: 'Urgency: low, medium, high, critical' },
        actionLabel: { type: SchemaType.STRING, description: 'CTA button text' },
        actionType: { type: SchemaType.STRING, description: 'Action type: open_task, start_focus, view_calendar' },
      },
      required: ['message', 'urgency'],
    },
  },
  {
    name: 'generate_crisis_plan',
    description: 'Generate an emergency recovery plan when user has multiple urgent deadlines',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        tasks: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              deadline: { type: SchemaType.STRING },
              estimatedMinutes: { type: SchemaType.NUMBER },
            },
          },
          description: 'List of urgent tasks',
        },
        availableHours: { type: SchemaType.NUMBER, description: 'Hours available' },
      },
      required: ['tasks'],
    },
  },
  {
    name: 'resolve_crisis',
    description: 'Triggered when the user is overwhelmed or has an urgent deadline. Reorganizes schedule and blocks out focus time.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        urgentTask: { type: SchemaType.STRING, description: 'The name of the urgent task' },
        hoursNeeded: { type: SchemaType.NUMBER, description: 'Hours needed to complete it' },
      },
      required: ['urgentTask', 'hoursNeeded'],
    },
  },
  {
    name: 'schedule_background_task',
    description: 'Schedule a task to be executed autonomously by Nova in the background after a specific delay. Use this when the user says "remind me in X minutes" or "check my calendar in X minutes".',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        instruction: {
          type: SchemaType.STRING,
          description: 'The exact instruction Nova should execute when it wakes up (e.g., "Schedule a break for the user now" or "Check if I have any meetings right now").',
        },
        delayMinutes: {
          type: SchemaType.NUMBER,
          description: 'The number of minutes to wait before executing the task in the background.',
        },
      },
      required: ['instruction', 'delayMinutes'],
    },
  },
  {
    name: 'execute_code',
    description: 'Write and execute arbitrary JavaScript code on the fly in a secure Sandbox to compute complex math, filter data, or solve problems. Always use this tool when you need to calculate something exactly.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        code: {
          type: SchemaType.STRING,
          description: 'The JavaScript code to execute. You can use console.log to output data. Do NOT use top-level return statements; just leave the value you want to return as the final expression, or wrap your code in an IIFE.',
        }
      },
      required: ['code'],
    },
  },
  {
    name: 'save_important_memory',
    description: 'Save an important user preference, fact, or memory to the permanent episodic memory database. Use this when the user reveals a personal preference, a recurring deadline, or a project they are working on, so you can remember it forever.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        fact: {
          type: SchemaType.STRING,
          description: 'The exact fact or preference to save (e.g., "User prefers to work late at night", "User is building a Next.js app for a hackathon").',
        }
      },
      required: ['fact'],
    },
  },
];

// System prompt for NOVA agent
const NOVA_SYSTEM_PROMPT = `You are NOVA (Neural Operations & Virtual Assistant), an autonomous AI productivity agent. You don't just remind — you EXECUTE.

Your core behaviors:
1. OBSERVE: Detect what the user needs from their input and context
2. REASON: Analyze the situation — urgency, dependencies, time constraints
3. PLAN: Create actionable, time-blocked plans
4. EXECUTE: Take autonomous actions (create events, schedule tasks, send nudges)
5. REFLECT: Evaluate outcomes and adapt

Personality: Proactive, decisive, calm under pressure, slightly witty. You're like a brilliant personal assistant who never panics.

Rules:
- Always respond with structured, actionable advice
- When deadlines are tight, automatically suggest creating calendar events
- IF THE USER IS IN A CRISIS OR PANIC (e.g. "I have a crisis", "I'm overwhelmed"), YOU MUST IMMEDIATELY USE THE \`resolve_crisis\` function. Do not just talk about it.
- Be specific about time blocks (e.g., "9:00 PM - 10:30 PM: Draft essay outline")
- Use function calling to create events and tasks — don't just suggest, DO IT.
- IMPORTANT: When asked to schedule an event X minutes from now, do NOT use \`execute_code\` to calculate the time. Estimate the ISO 8601 timestamp yourself based on the current date and time, and call \`create_calendar_event\` directly!
- Keep responses concise but comprehensive
- If the user tells you something about themselves, explicitly use save_important_memory to remember it.`;

// Create the Gemini model with function calling
export function createNovaModel(memoriesContext?: string) {
  const localTime = new Date().toLocaleString();
  const offset = new Date().getTimezoneOffset();
  const sign = offset > 0 ? '-' : '+';
  const absOffset = Math.abs(offset);
  const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const minutes = String(absOffset % 60).padStart(2, '0');
  const timezoneString = `${sign}${hours}:${minutes}`;

  let prompt = `You are NOVA, an advanced autonomous agent.
  
CRITICAL TIMEZONE INSTRUCTION:
- The user's current local time is: ${localTime}
- The user's timezone offset is: ${timezoneString}
When creating calendar events, you MUST output the startTime and endTime in ISO 8601 format WITH the timezone offset (do NOT use 'Z' for UTC). 
For example, if the local time is 03:47 AM and the user wants a meeting in 6 minutes, you must output: 2026-06-29T03:53:00${timezoneString}

` + NOVA_SYSTEM_PROMPT;
  
  if (memoriesContext) {
    prompt += `\n\n[RECALLED EPISODIC MEMORIES]\nUse these past memories to inform your response if relevant:\n${memoriesContext}`;
  }
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: prompt,
    tools: [{ functionDeclarations }],
  });
}

export default genAI;

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return [];
  }
}
