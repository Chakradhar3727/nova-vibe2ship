'use client';

import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Search, LogOut, ArrowRight, User as UserIcon, Calendar, Zap, Shield, Sparkles, Command, BrainCircuit, Activity } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useState, useEffect, useRef } from 'react';

// Custom component for the staggering text reveal
const StaggeredText = ({ text, className }: { text: string, className: string }) => {
  const words = text.split(" ");
  return (
    <motion.div 
      className={`flex flex-wrap justify-center ${className}`}
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.08 } }
      }}
    >
      {words.map((word, idx) => (
        word === "<br/>" ? <div key={`br-${idx}`} className="w-full h-0" /> :
        <motion.span 
          key={idx} 
          className="mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: "spring", damping: 12, stiffness: 100 } }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  
  // Mouse tracking for dynamic spotlight effect
  const spotlightRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(255,255,255,0.03), transparent 40%)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-white selection:text-black flex flex-col font-[family-name:var(--font-inter)] overflow-x-hidden relative">
      
      {/* Dynamic Cursor Spotlight (Subtle) */}
      <div 
        ref={spotlightRef}
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300 opacity-50 mix-blend-screen"
      />

      {/* Animated Ambient Glows (Deep Atmospheric Aurora) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-indigo-500/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.5, 0.2],
            x: [0, -80, 0],
            y: [0, -100, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[1000px] max-h-[1000px] bg-purple-500/20 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.4, 0.1],
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute top-[30%] left-[40%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" 
        />
      </div>

      {/* Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_40%,transparent_100%)]" />
      </div>

      {/* Avant-Garde Nav */}
      <nav className="h-[80px] w-full flex items-center justify-between px-8 lg:px-12 sticky top-0 z-50 mix-blend-difference">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
          <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center group-hover:rotate-90 transition-transform duration-500 ease-in-out">
            <div className="w-4 h-4 bg-black rounded-full" />
          </div>
          <span className="font-bold text-white text-xl tracking-tighter uppercase">Nova.</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md group transition-all duration-500 ease-out cursor-default">
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-3 h-3 text-white/70" />
                )}
              </div>
              
              <div className="max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100 group-hover:ml-3 overflow-hidden transition-all duration-500 ease-out whitespace-nowrap flex items-center">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/80">
                  {user.displayName?.split(' ')[0] || 'USER'} // ONLINE
                </span>
              </div>
              
              <div className="w-px h-3 bg-white/20 ml-3 mr-3 shrink-0" />
              
              <button 
                onClick={logout}
                className="text-white/30 hover:text-white transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => router.push('/login')}
              className="group relative px-6 py-2.5 overflow-hidden rounded-full bg-white text-black font-medium text-sm transition-all hover:scale-105 active:scale-95"
            >
              Initialize Engine
            </button>
          )}
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center relative z-10 w-full">
        
        {/* Masterpiece Hero Section */}
        <section className="w-full min-h-[85vh] flex flex-col items-center justify-center relative px-6 pt-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute top-[12%] left-8 xl:left-16 hidden xl:flex flex-col gap-2 opacity-30 font-mono text-[10px] tracking-widest text-white/50 uppercase"
          >
            <span>SYS.STATUS // ONLINE</span>
            <span>MEM.ALLOC // OPTIMAL</span>
            <span>CRISIS.PROTO // STANDBY</span>
          </motion.div>

          <StaggeredText 
            text="Autonomous <br/> Time Architecture." 
            className="text-[60px] md:text-[100px] lg:text-[120px] font-bold leading-[0.9] tracking-tighter text-center max-w-[1200px] mb-8"
          />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="text-lg md:text-xl font-light text-white/40 text-center max-w-2xl mb-12 tracking-wide"
          >
            We don't just alert you. We take control. Watch Nova manipulate your calendar, resolve conflicts, and deploy Crisis blocks in real-time.
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.2, type: "spring" }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
             <button 
                onClick={() => router.push('/chat')}
                className="relative overflow-hidden rounded-full p-[1px] group w-full sm:w-auto"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white via-gray-400 to-white rounded-full opacity-40 group-hover:opacity-100 group-hover:blur-md transition-all duration-500 animate-spin" style={{ animationDuration: '4s' }} />
                <div className="relative bg-black text-white px-8 py-4 rounded-full font-medium text-sm flex items-center justify-center gap-3 transition-all group-hover:bg-transparent">
                  <Command className="w-4 h-4" /> Command Center
                </div>
              </button>
              
             <button 
                onClick={() => router.push('/crisis-demo')}
                className="relative overflow-hidden rounded-full p-[1px] group w-full sm:w-auto"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-70 group-hover:opacity-100 group-hover:blur-md transition-all duration-500 animate-spin" style={{ animationDuration: '4s' }} />
                <div className="relative bg-black text-white px-8 py-4 rounded-full font-medium text-sm flex items-center justify-center gap-3 transition-all group-hover:bg-transparent">
                  <Zap className="w-4 h-4" /> Trigger Crisis
                </div>
              </button>
          </motion.div>
        </section>

        {/* The Bento Box UI */}
        <section className="w-full max-w-[1400px] px-6 py-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:h-[700px]"
          >
            {/* Bento 1: Large Visual */}
            <div className="md:col-span-2 md:row-span-1 rounded-[32px] bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-10 flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 group-hover:bg-indigo-500/20 transition-colors duration-700" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                  <Command className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-3xl font-medium tracking-tight mb-4">Command Center</h3>
                <p className="text-white/40 max-w-md">Nova acts as the central nervous system of your schedule. It reads the gaps, understands the priorities, and acts instantly.</p>
              </div>
              
              {/* Abstract UI element */}
              <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[80%] bg-black rounded-tl-3xl border-t border-l border-white/10 flex flex-col p-6 shadow-2xl rotate-[-2deg] group-hover:rotate-0 group-hover:translate-y-[-10px] transition-all duration-500">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                 </div>
                 <div className="flex-1 border-t border-white/5 pt-4 flex flex-col gap-3 opacity-50">
                    <div className="h-2 w-full bg-white/20 rounded" />
                    <div className="h-2 w-3/4 bg-white/10 rounded" />
                    <div className="h-2 w-1/2 bg-white/10 rounded" />
                 </div>
              </div>
            </div>

            {/* Bento 2: The Agent Brain */}
            <div className="md:col-span-1 md:row-span-1 rounded-[32px] bg-[#0A0A0A] border border-white/10 p-10 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <BrainCircuit className="w-16 h-16 text-white mb-6 group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
              <h3 className="text-2xl font-medium tracking-tight mb-2 text-center">Gemini Powered</h3>
              <p className="text-white/40 text-center text-sm">Powered by Gemini 2.5 Flash, executing function calls with near-zero latency.</p>
            </div>

            {/* Bento 3: Crisis Mode Block */}
            <div className="md:col-span-1 md:row-span-1 rounded-[32px] bg-red-950/20 border border-red-500/20 p-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
               <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                  <Activity className="w-4 h-4 text-red-500" />
               </div>
               <h3 className="text-2xl font-medium tracking-tight mb-3 text-red-50">Crisis Protocol</h3>
               <p className="text-red-200/50 text-sm">When overloaded, Nova automatically drafts cancellation emails and blocks out "Crisis Focus" time on your real calendar.</p>
            </div>

            {/* Bento 4: Wide Card */}
            <div className="md:col-span-2 md:row-span-1 rounded-[32px] bg-zinc-950 border border-white/10 p-10 relative overflow-hidden group flex flex-col justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-3xl font-medium tracking-tight mb-4 text-white">Full Calendar Sync.</h3>
              <p className="text-white/40 max-w-lg text-lg">
                We aren't a mock app. Connect your actual Google account. Watch the AI execute real read/write operations instantly on your live schedule.
              </p>
              
              <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 opacity-20 blur-sm group-hover:blur-none group-hover:opacity-100 transition-all duration-700">
                <span className="text-[150px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent">
                  SYNC
                </span>
              </div>
            </div>

          </motion.div>
        </section>

      </main>

      {/* Minimalist Footer */}
      <footer className="w-full flex items-center justify-between px-12 py-8 text-xs text-white/30 uppercase tracking-widest font-mono">
        <div>© 2026 NOVA SYS.</div>
        <div className="flex gap-8">
          <span className="hover:text-white cursor-pointer transition-colors">INIT</span>
          <span className="hover:text-white cursor-pointer transition-colors">SPECS</span>
        </div>
      </footer>
    </div>
  );
}
