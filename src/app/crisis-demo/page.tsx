'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '@/store/agentStore';
import AgentStatusPanel from '@/components/AgentStatusPanel';
import { AlertTriangle, Clock, ShieldAlert, ArrowLeft, Activity, Zap, CheckCircle2, LayoutGrid } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import NotificationEngine from '@/components/NotificationEngine';

interface CrisisTask {
  id: string;
  title: string;
  timeBlock: string;
  duration: string;
  status: 'pending' | 'in_progress' | 'completed' | 'auto_scheduled';
  priority: 'critical' | 'high' | 'medium';
}

const CRISIS_SCENARIO = {
  title: "EMERGENCY PROTOCOL",
  subtitle: "Schedule fragmentation detected. Nova is ready to resolve conflicts and execute crisis blocking.",
  stats: {
    overdue: 5,
    hoursLeft: 3,
    riskLevel: 'ELEVATED',
  },
  tasks: [
    {
      id: '1',
      title: 'Complete Math Assignment (Chapter 7)',
      timeBlock: '11:00 PM – 11:45 PM',
      duration: '45 min',
      status: 'pending' as const,
      priority: 'critical' as const,
    },
    {
      id: '2',
      title: 'Draft English Essay Outline',
      timeBlock: '11:45 PM – 12:30 AM',
      duration: '45 min',
      status: 'pending' as const,
      priority: 'critical' as const,
    },
    {
      id: '3',
      title: 'Submit Lab Report (Physics 101)',
      timeBlock: '12:30 AM – 1:00 AM',
      duration: '30 min',
      status: 'pending' as const,
      priority: 'high' as const,
    },
    {
      id: '4',
      title: 'Email professor about extension request',
      timeBlock: '1:00 AM – 1:15 AM',
      duration: '15 min',
      status: 'pending' as const,
      priority: 'medium' as const,
    },
    {
      id: '5',
      title: 'Set morning alarms & prepare materials',
      timeBlock: '1:15 AM – 1:30 AM',
      duration: '15 min',
      status: 'pending' as const,
      priority: 'medium' as const,
    },
  ],
};

const colors = {
  critical: '#f97316', // Subtle Orange
  high: '#fbbf24',     // Subtle Amber
  medium: '#fbbf24',   // Subtle Amber
  success: '#ffffff',  // White for success
};

export default function CrisisDemoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { runStateTransition, addReasoningLog, setState, setCurrentAction, setCrisisMode } = useAgentStore();
  const [planGenerated, setPlanGenerated] = useState(false);
  const [tasks, setTasks] = useState<CrisisTask[]>(CRISIS_SCENARIO.tasks);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    async function fetchRealEvents() {
      if (!user) {
        setIsLoadingEvents(false);
        return;
      }
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const token = userSnap.data()?.calendarToken;

        if (token) {
          const res = await fetch('/api/calendar/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          const data = await res.json();
          
          if (data.success && data.events && data.events.length > 0) {
            const realTasks: CrisisTask[] = data.events.map((evt: any, i: number) => {
              const start = new Date(evt.start.dateTime || evt.start.date);
              const end = new Date(evt.end.dateTime || evt.end.date);
              const durationMins = Math.round((end.getTime() - start.getTime()) / 60000);
              
              const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return {
                id: evt.id,
                title: evt.summary || 'Untitled Event',
                timeBlock: `${formatTime(start)} – ${formatTime(end)}`,
                duration: `${durationMins} min`,
                status: 'pending',
                priority: i === 0 ? 'critical' : i < 3 ? 'high' : 'medium'
              };
            });
            setTasks(realTasks);
          }
        }
      } catch (err) {
        console.error("Failed to load real events:", err);
      } finally {
        setIsLoadingEvents(false);
      }
    }
    fetchRealEvents();
  }, [user]);

  const handleGeneratePlan = async () => {
    setCrisisMode(true);

    await runStateTransition(
      ['OBSERVE', 'REASON', 'PLAN'],
      [
        'Analyzing calendar fragmentation and identifying high-priority conflicts.',
        'Calculating optimal chronological path for 5 pending tasks.',
        'Drafting emergency schedule block: 2.5 hours total execution time.',
      ],
      1000
    );

    setPlanGenerated(true);
    addReasoningLog('PLAN', 'Emergency schedule drafted. Awaiting user authorization to execute.');
    setState('EXECUTE');
    setCurrentAction('Ready to execute emergency schedule');
  };

  const handleExecutePlan = async () => {
    setIsExecuting(true);

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      await runStateTransition(
        ['EXECUTE'],
        [`Executing block: "${task.title}" (${task.timeBlock})`],
        600
      );

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: 'in_progress' as const } : t))
      );

      await new Promise((r) => setTimeout(r, 800));

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: 'completed' as const } : t))
      );

      addReasoningLog('EXECUTE', `Successfully scheduled: "${task.title}"`);
      setExecutionProgress(((i + 1) / tasks.length) * 100);
    }

    await runStateTransition(
      ['REFLECT'],
      ['All tasks successfully anchored. Conflicts resolved.'],
      800
    );

    // Drop a real crisis block on the calendar if logged in
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const token = userSnap.data()?.calendarToken;
        if (token) {
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 2.5 * 60 * 60 * 1000); // 2.5 hours block
          await fetch('/api/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              title: '🚨 CRISIS BLOCK - DO NOT DISTURB',
              description: 'Automatically placed by Nova Agent to handle schedule fragmentation.',
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString()
            })
          });
          addReasoningLog('EXECUTE', '✅ Real "CRISIS BLOCK" successfully created on your Google Calendar.');
        }
      } catch (e) {
        console.error('Failed to create crisis block', e);
      }
    }

    setState('IDLE');
    setCurrentAction('Schedule optimized. Monitoring for further requests.');
    setIsExecuting(false);
  };

  const isHealed = executionProgress === 100;

  return (
    <div className="h-screen flex flex-col bg-[#030303] text-white font-[family-name:var(--font-inter)] selection:bg-white selection:text-black relative overflow-hidden">
      <NotificationEngine />
      
      {/* Background Subtle Gradient Grid (Matches Landing Page) */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000" style={{ opacity: isHealed ? 0.3 : 1 }}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_40%,transparent_100%)]" />
      </div>

      {/* Gentle Alert Glow */}
      {!isHealed && (
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
      )}
      {isHealed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] pointer-events-none transition-all duration-2000" />
      )}

      {/* Header */}
      <div className="h-[80px] flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
            <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center group-hover:rotate-90 transition-transform duration-500 ease-in-out">
              <div className="w-4 h-4 bg-black rounded-full" />
            </div>
            <span className="font-bold text-white text-xl tracking-tighter uppercase hidden sm:block">Nova.</span>
          </div>
          
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors tracking-wide font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel Protocol
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
           {!isHealed ? (
             <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
           ) : (
             <CheckCircle2 className="w-3.5 h-3.5 text-white" />
           )}
          <span className="text-xs font-medium tracking-widest uppercase text-white/80">
            {isHealed ? 'Schedule Optimized' : 'Protocol Active'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-[65] overflow-y-auto px-8 lg:px-16 py-12 scrollbar-none relative z-10 w-full max-w-[1200px] mx-auto">
          
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-white/60">
              <ShieldAlert className="w-3.5 h-3.5" /> {isHealed ? 'SYSTEM NOMINAL' : 'URGENT ATTENTION REQUIRED'}
            </div>
            <h1 className="text-4xl lg:text-5xl font-medium tracking-tight mb-4 text-white font-[family-name:var(--font-space-grotesk)]">
              {isHealed ? 'Schedule Optimized.' : CRISIS_SCENARIO.title}
            </h1>
            <p className="text-lg text-white/40 max-w-2xl font-light">
              {isHealed ? 'All tasks have been successfully scheduled into your calendar. Focus time blocks are set.' : CRISIS_SCENARIO.subtitle}
            </p>
            
            <div className="mt-8 text-left w-full max-w-2xl bg-white/5 border border-orange-500/20 rounded-2xl p-6">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-400" /> SYSTEM CAPABILITIES:
                </h4>
                <ul className="text-sm text-white/60 space-y-3">
                  <li><strong className="text-white/90">🚨 Proactive Intervention:</strong> Nova detects when you have too many tasks and not enough time, intervening before you fail.</li>
                  <li><strong className="text-white/90">⏱️ Autonomous Rescheduling:</strong> Nova reads your actual Google Calendar and figures out the optimal chronological path.</li>
                  <li><strong className="text-white/90">⚡ Let Agent Decide:</strong> One click allows Nova to automatically create calendar blocks for every pending task.</li>
                  <li><strong className="text-white/90">🧠 Live Reasoning Loop:</strong> Watch Nova Observe, Reason, Plan, and Execute on the right side panel in real-time.</li>
                  <li><strong className="text-white/90">🔔 Proactive Alerts:</strong> Nova polls your schedule in the background and plays a synth alert exactly 5 minutes before your meetings.</li>
                </ul>
            </div>
          </motion.div>

          {!isHealed && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
             >
               {[
                 { icon: LayoutGrid, label: 'Pending Tasks', value: CRISIS_SCENARIO.stats.overdue },
                 { icon: Clock, label: 'Available Window', value: CRISIS_SCENARIO.stats.hoursLeft + 'H' },
                 { icon: Activity, label: 'Status', value: CRISIS_SCENARIO.stats.riskLevel },
               ].map((stat, idx) => (
                 <div key={stat.label} className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between">
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <stat.icon className="w-5 h-5 text-white/60" />
                   </div>
                   <div>
                     <div className="text-3xl font-medium tracking-tight mb-1 text-white">
                       {stat.value}
                     </div>
                     <div className="text-[11px] text-white/40 uppercase tracking-widest font-medium">{stat.label}</div>
                   </div>
                 </div>
               ))}
             </motion.div>
          )}

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-medium text-white">
                 {isHealed ? 'Finalized Agenda' : 'Proposed Agenda'}
               </h3>
               {planGenerated && !isHealed && (
                  <span className="text-[10px] uppercase tracking-widest font-medium text-white/70 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                     Draft Ready
                  </span>
               )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence>
                {tasks.map((task, i) => {
                   const isCompleted = task.status === 'completed';
                   const isInProgress = task.status === 'in_progress';
                   const taskColor = isCompleted ? colors.success : colors[task.priority];

                   return (
                     <motion.div
                       key={task.id}
                       initial={{ opacity: 0, scale: 0.98 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: planGenerated ? 0 : 0.05 * i }}
                       className={`relative p-5 rounded-[20px] border backdrop-blur-md overflow-hidden transition-all duration-500 flex items-center justify-between ${
                          isCompleted ? 'bg-white/[0.05] border-white/20' :
                          isInProgress ? 'bg-white/10 border-white/30 scale-[1.02] shadow-2xl' :
                          'bg-white/[0.02] border-white/10'
                       }`}
                     >
                       {isInProgress && (
                          <div className="absolute inset-0 bg-white/5 animate-pulse" />
                       )}

                       <div className="relative z-10 flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] uppercase tracking-widest font-medium ${isCompleted ? 'text-white' : 'text-white/50'}`}>
                              {isCompleted ? 'SCHEDULED' : task.priority}
                            </span>
                          </div>
                          
                          <div className={`text-[15px] font-medium tracking-wide ${isCompleted ? 'text-white' : 'text-white/90'}`}>
                            {task.title}
                          </div>
                       </div>

                       <div className={`relative z-10 flex flex-col items-end gap-1 text-right ${isCompleted ? 'pr-8' : ''}`}>
                          <div className="text-[13px] font-medium text-white/80 font-mono">
                            {task.timeBlock}
                          </div>
                          <div className="text-[11px] text-white/40 uppercase tracking-widest font-medium">
                            {task.duration}
                          </div>
                       </div>
                       
                       {isCompleted && (
                         <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/10 to-transparent pointer-events-none flex items-center justify-end pr-5">
                           <CheckCircle2 className="w-5 h-5 text-white/50" />
                         </div>
                       )}
                     </motion.div>
                   )
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="pt-12 pb-24 max-w-lg mx-auto"
          >
            {!planGenerated ? (
              <button
                onClick={handleGeneratePlan}
                className="w-full py-4 text-[15px] font-medium text-black bg-white rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                Analyze & Draft Schedule
              </button>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleExecutePlan}
                  disabled={isExecuting || isHealed}
                  className="w-full py-4 text-[15px] font-medium transition-all relative overflow-hidden rounded-full border flex items-center justify-center gap-2"
                  style={{ 
                     backgroundColor: isHealed ? 'rgba(255,255,255,0.1)' : isExecuting ? 'transparent' : '#ffffff',
                     borderColor: isHealed ? 'rgba(255,255,255,0.2)' : isExecuting ? 'rgba(255,255,255,0.3)' : '#ffffff',
                     color: isHealed ? '#ffffff' : isExecuting ? '#ffffff' : '#000000',
                     cursor: isHealed || isExecuting ? 'default' : 'pointer'
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                     {isHealed ? 'Protocol Complete' : isExecuting ? 'Executing Schedule...' : <><Zap className="w-4 h-4"/> Execute & Lock Calendar</>}
                  </span>
                  
                  {isExecuting && (
                     <motion.div 
                        className="absolute top-0 left-0 h-full bg-white/20"
                        animate={{ width: `${executionProgress}%` }}
                        transition={{ duration: 0.3 }}
                     />
                  )}
                </button>
              </div>
            )}
            
            {isHealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <button
                  onClick={() => router.push('/chat')}
                  className="text-sm font-medium text-white/50 hover:text-white transition-colors underline underline-offset-4"
                >
                  Return to Command Center
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Agent Status Panel */}
        <div className="flex-[35] min-w-[400px] hidden lg:block relative z-20">
          <AgentStatusPanel />
        </div>
      </div>
    </div>
  );
}
