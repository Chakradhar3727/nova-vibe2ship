// Background Web Worker for NOVA

export type BackgroundTask = {
  id: string;
  instruction: string;
  executeAt: number; // timestamp
  completed: boolean;
};

let interval: ReturnType<typeof setInterval> | null = null;
let tasks: BackgroundTask[] = [];

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;
  
  if (type === 'START') {
    if (interval) clearInterval(interval);
    
    // The heartbeat loop - checks every 5 seconds
    interval = setInterval(() => {
      const now = Date.now();
      // Find tasks that are scheduled for now or earlier, and haven't been completed
      const readyTasks = tasks.filter(t => t.executeAt <= now && !t.completed);
      
      if (readyTasks.length > 0) {
        // Send a message back to the main thread to wake up Nova
        self.postMessage({ type: 'EXECUTE_TASKS', tasks: readyTasks });
      }
    }, 5000);
  }
  
  if (type === 'SYNC_TASKS') {
    tasks = payload;
  }
  
  if (type === 'STOP') {
    if (interval) clearInterval(interval);
  }
};
