// Main Chat Page — Split Layout: Chat + Agent Status Panel
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, LogOut, Trash2 } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import AgentStatusPanel from '@/components/AgentStatusPanel';
import AutonomyToggle from '@/components/AutonomyToggle';
import NotificationEngine from '@/components/NotificationEngine';

import { useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useAgentStore } from '@/store/agentStore';

export default function ChatPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { initializeStore, resetChat } = useAgentStore();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      initializeStore();
    }
  }, [user, loading, router, initializeStore]);

  if (loading || !user) return <div className="h-screen bg-[#030303]" />; // Blank slate while loading

  return (
    <div className="h-screen flex flex-col bg-[#030303] text-white font-[family-name:var(--font-inter)] selection:bg-white selection:text-black relative overflow-hidden">
      <NotificationEngine />
      
      {/* Background Subtle Gradient Grid (Matches Landing Page) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_40%,transparent_100%)]" />
      </div>

      {/* Top Bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-[80px] flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-xl z-50 sticky top-0"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
            <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center group-hover:rotate-90 transition-transform duration-500 ease-in-out">
              <div className="w-4 h-4 bg-black rounded-full" />
            </div>
            <span className="font-bold text-white text-xl tracking-tighter uppercase">Nova.</span>
          </div>
          
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          
          <span className="text-[10px] uppercase tracking-widest text-white/40 hidden md:block font-mono">
            Command Center
          </span>
        </div>

        <div className="flex items-center gap-4">
          <AutonomyToggle />
          
          <div className="h-6 w-px bg-white/10" />

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear the chat?')) {
                resetChat();
              }
            }}
            className="group relative px-4 py-2 overflow-hidden rounded-full border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400 group-hover:text-red-300 transition-colors" />
            <span className="text-xs font-medium text-red-400 group-hover:text-red-300 transition-colors uppercase tracking-wider">Clear</span>
          </button>
        </div>
      </motion.header>

      {/* Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - 65% */}
        <div className="flex-[65] min-w-0">
          <ChatInterface />
        </div>

        {/* Agent Status Panel - 35% */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-[35] min-w-[320px] hidden lg:block"
        >
          <AgentStatusPanel />
        </motion.div>
      </div>
    </div>
  );
}
