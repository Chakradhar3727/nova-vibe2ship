'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore, AGENT_STATES, AgentStateType } from '@/store/agentStore';
import { Brain, Activity, Zap, Eye, Lightbulb, RotateCcw, AlertTriangle, Bell } from 'lucide-react';
import { playNotificationSound } from './NotificationEngine';

const STATE_ICONS: Record<AgentStateType, React.ReactNode> = {
  IDLE: <Activity className="w-[18px] h-[18px]" />,
  OBSERVE: <Eye className="w-[18px] h-[18px]" />,
  REASON: <Brain className="w-[18px] h-[18px]" />,
  PLAN: <Lightbulb className="w-[18px] h-[18px]" />,
  EXECUTE: <Zap className="w-[18px] h-[18px]" />,
  REFLECT: <RotateCcw className="w-[18px] h-[18px]" />,
  CRISIS: <AlertTriangle className="w-[18px] h-[18px]" />,
  BACKGROUND: <Activity className="w-[18px] h-[18px]" />,
};

const PIPELINE_STATES: AgentStateType[] = ['OBSERVE', 'REASON', 'PLAN', 'EXECUTE', 'REFLECT'];

export default function AgentStatusPanel() {
  const { currentState, reasoningLog, confidence, currentAction } = useAgentStore();
  const stateInfo = AGENT_STATES[currentState];

  const getSubtleColor = (state: AgentStateType, active: boolean) => {
    if (!active) return '#333333';
    switch (state) {
      case 'CRISIS': return '#f87171'; // Red-400
      case 'EXECUTE': return '#ffffff'; // White
      case 'IDLE': return '#888888';
      default: return '#ffffff'; // Default active is white
    }
  };

  const activeColor = getSubtleColor(currentState, true);

  return (
    <div className="h-full flex flex-col bg-transparent font-[family-name:var(--font-inter)] border-l border-white/5">
      {/* Header */}
      <div className="h-[80px] px-8 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-sm font-bold text-white tracking-widest uppercase">
          Agent Status
        </h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if ('Notification' in window) {
                Notification.requestPermission().then(perm => {
                  if (perm === 'granted') {
                    new Notification('Nova Alert System', { body: 'Notifications are working perfectly!' });
                  } else {
                    alert('Please allow notifications in your browser settings to use this feature.');
                  }
                });
              }
              playNotificationSound();
            }}
            className="group px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 flex items-center gap-2 transition-all"
            title="Test Alert System"
          >
            <Bell className="w-3 h-3 text-white/50 group-hover:text-white transition-colors" />
            <span className="text-[10px] text-white/70 font-mono tracking-widest uppercase group-hover:text-white">Test Alert</span>
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: activeColor }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[10px] text-white/70 font-mono tracking-widest uppercase">Live</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8 space-y-8 overflow-y-auto scrollbar-none flex-1 pb-20">
        
        {/* Current State */}
        <section>
          <div className="text-[10px] text-white/40 mb-3 uppercase tracking-[0.2em] font-medium">System State</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentState}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white/[0.02] backdrop-blur-md rounded-[24px] p-6 border border-white/10 relative overflow-hidden group"
            >
              {/* Subtle Background Glow */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10 pointer-events-none transition-colors duration-700 -translate-y-1/2 translate-x-1/2" 
                style={{ backgroundColor: activeColor }} 
              />
              
              <div className="flex items-center gap-5 relative z-10">
                <div 
                  className="w-12 h-12 rounded-[16px] flex items-center justify-center border border-white/10 bg-white/5"
                  style={{ color: activeColor }}
                >
                  {STATE_ICONS[currentState]}
                </div>
                <div>
                  <div className="text-xl font-medium tracking-tight font-[family-name:var(--font-space-grotesk)] text-white">
                    {stateInfo.label}
                  </div>
                  <div className="text-sm text-white/40 mt-1 font-light">
                    {stateInfo.description}
                  </div>
                </div>
              </div>

              {confidence > 0 && (
                <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between relative z-10">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Confidence Score</span>
                  <span className="text-sm font-mono text-white/90">
                     {Math.round(confidence)}%
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* State Pipeline */}
        <section>
          <div className="text-[10px] text-white/40 mb-3 uppercase tracking-[0.2em] font-medium">Processing Pipeline</div>
          <div className="bg-white/[0.02] backdrop-blur-md rounded-[24px] p-8 border border-white/10">
            <div className="flex items-center justify-between relative">
              {PIPELINE_STATES.map((state, i) => {
                const isActive = state === currentState;
                const isPast = PIPELINE_STATES.indexOf(currentState as AgentStateType) > i;
                const stateColor = getSubtleColor(state, isActive || isPast);

                return (
                  <div key={state} className="flex flex-col items-center gap-4 relative z-10">
                    <div 
                      className={`w-3 h-3 rounded-full border transition-all duration-500 flex items-center justify-center bg-[#030303]`}
                      style={{ 
                        borderColor: isActive || isPast ? stateColor : '#222222',
                      }}
                    >
                       {isPast && !isActive && (
                          <div className="w-1 h-1 bg-white rounded-full opacity-50" />
                       )}
                       {isActive && (
                          <motion.div 
                             className="w-1.5 h-1.5 bg-current rounded-full"
                             style={{ color: stateColor }}
                             animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                             transition={{ duration: 1.5, repeat: Infinity }}
                          />
                       )}
                    </div>
                    <span 
                      className="text-[9px] font-medium tracking-widest uppercase transition-colors duration-500"
                      style={{ color: isActive ? '#ffffff' : '#555555' }}
                    >
                      {state.substring(0, 3)}
                    </span>
                  </div>
                );
              })}
              
              {/* Pipeline connector line */}
              <div className="absolute left-[20px] right-[20px] h-[1px] bg-white/5 top-[5px] z-0" />
              {/* Progress fill */}
              <motion.div 
                className="absolute left-[20px] h-[1px] top-[5px] z-0" 
                initial={false}
                animate={{ 
                  width: PIPELINE_STATES.includes(currentState as AgentStateType) 
                    ? `calc(${(PIPELINE_STATES.indexOf(currentState as AgentStateType) / (PIPELINE_STATES.length - 1)) * 100}% - 40px)` 
                    : '0%' 
                }}
                transition={{ duration: 0.5 }}
                style={{ backgroundColor: activeColor }}
              />
            </div>
          </div>
        </section>

        {/* Current Action */}
        {currentAction && (
          <section>
            <div className="text-[10px] text-white/40 mb-3 uppercase tracking-[0.2em] font-medium">Active Protocol</div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-white/70 bg-white/[0.02] backdrop-blur-md p-5 rounded-[20px] border border-white/10 flex items-center gap-3"
            >
              <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
              {currentAction}
            </motion.div>
          </section>
        )}

        {/* Reasoning Log */}
        <section className="flex-1 flex flex-col min-h-[350px]">
          <div className="text-[10px] text-white/40 mb-3 uppercase tracking-[0.2em] font-medium">System Output</div>
          <div className="bg-white/[0.02] backdrop-blur-md rounded-[24px] border border-white/10 overflow-hidden flex-1 flex flex-col relative">
            
            <div className="p-6 flex-1 overflow-y-auto scrollbar-none space-y-5">
              <AnimatePresence initial={false}>
                {reasoningLog.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs flex flex-col gap-1 border-b border-white/5 pb-5 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-medium text-white/90 tracking-wider uppercase border border-white/10 px-2 py-0.5 rounded-sm bg-white/5">
                        {entry.state}
                      </span>
                      <span className="text-white/30 font-mono text-[9px]">
                        {entry.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-white/50 leading-relaxed font-mono text-[11px] mt-1 pl-1">
                      {entry.message}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {reasoningLog.length === 0 && (
                <div className="text-[11px] text-white/30 text-center mt-12 font-mono flex flex-col items-center gap-2">
                  <Activity className="w-4 h-4 opacity-30" />
                  Awaiting input sequence
                </div>
              )}
            </div>
            
            {/* Fade out at bottom for scrolling */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none opacity-80" />
          </div>
        </section>

      </div>
    </div>
  );
}
