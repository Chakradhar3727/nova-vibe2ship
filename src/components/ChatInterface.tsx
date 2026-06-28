'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore, ChatMessage } from '@/store/agentStore';
import { Send, Mic, Command, ArrowRight, BrainCircuit, Calendar, AlertTriangle, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import { processUserMessage } from '../lib/agentController';

const LANGUAGES = [
  { code: 'en-US', label: 'ENG' },
  { code: 'hi-IN', label: 'HIN' },
  { code: 'te-IN', label: 'TEL' },
  { code: 'ta-IN', label: 'TAM' },
  { code: 'bn-IN', label: 'BEN' },
  { code: 'mr-IN', label: 'MAR' },
];

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-US');
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isProcessing, addMessage } = useAgentStore();

  const renderMessageContent = (content: string) => {
    if (!content) return null;

    // Parse generic markdown links [label](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{content.slice(lastIndex, match.index)}</span>);
      }

      const label = match[1];
      const url = match[2];

      if (url.includes('google.com/calendar/event')) {
        // Render beautiful Event Card for calendar links
        parts.push(
          <a
            key={`cal-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block my-4 p-5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/30 rounded-2xl hover:border-indigo-500/60 hover:from-indigo-500/20 hover:via-purple-500/20 transition-all duration-300 group flex items-center justify-between no-underline shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)]"
          >
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500/20 p-3.5 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-white font-semibold flex items-center gap-2 text-[16px]">
                  {label.replace(/\*/g, '')} <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-white/60 text-[13px] mt-1 group-hover:text-white/90 transition-colors">
                  Click to open in Google Calendar
                </div>
              </div>
            </div>
            <div className="bg-white/5 p-2.5 rounded-full text-white/50 group-hover:text-white group-hover:bg-white/15 transition-all">
              <ExternalLink className="w-5 h-5" />
            </div>
          </a>
        );
      } else {
        // Standard inline link
        parts.push(
          <a
            key={`link-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors font-medium"
          >
            {label}
          </a>
        );
      }
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(<span key={`text-${lastIndex}`}>{content.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : content;
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLang;

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (currentTranscript) {
            setInput((prev) => prev + currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [selectedLang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start speech recognition:", e);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    await processUserMessage(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative overflow-hidden font-[family-name:var(--font-inter)]">

      {/* Background Subtle Gradient Grid (Matches Landing Page) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_40%,transparent_100%)]" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-8 scrollbar-none relative z-10 w-full max-w-[1200px] mx-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 mt-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-[24px] bg-white/[0.02] border border-white/10 flex items-center justify-center mb-8 shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                <BrainCircuit className="w-8 h-8 text-white relative z-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-4xl font-medium tracking-tight text-white mb-4 font-[family-name:var(--font-space-grotesk)]">
                Command Center
              </h3>
              <p className="text-base text-white/40 mb-12 max-w-lg">
                Nova is online and connected to your calendar. How can we optimize your schedule today?
              </p>

              <div className="text-left w-full max-w-lg bg-white/5 border border-white/10 rounded-2xl p-6 mb-12">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> SYSTEM CAPABILITIES:
                </h4>
                <ul className="text-sm text-white/60 space-y-3">
                  <li><strong className="text-white/90">🎙️ Multi-Language Voice:</strong> Click the mic and speak in Hindi, Telugu, Tamil, Bengali, or Marathi to schedule events.</li>
                  <li><strong className="text-white/90">🗓️ Calendar Control:</strong> Ask Nova to schedule meetings or block focus time directly into Google Calendar.</li>
                  <li><strong className="text-white/90">🧠 Permanent Memory:</strong> Tell Nova facts (e.g. "I'm a student") and it will remember them forever using its Local Vector DB.</li>
                  <li><strong className="text-white/90">💻 Code Sandbox:</strong> Ask Nova to write a script and it will securely execute the JS code on the fly to give you the result.</li>
                  <li><strong className="text-white/90">🤖 Background Tasks:</strong> Say "Remind me in 1 minute" to trigger the autonomous background worker.</li>
                  <li><strong className="text-white/90">🔔 Proactive Alerts:</strong> Nova polls your schedule in the background and plays a synth alert exactly 5 minutes before your meetings.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
                {[
                  { text: 'I have a crisis, I need to finish this hackathon project in 4 hours!', icon: AlertTriangle },
                  { text: 'Schedule my study plan for this week', icon: Calendar },
                  { text: 'Clear my afternoon for deep work', icon: Command },
                  { text: 'Reschedule my 3PM meeting to tomorrow', icon: ArrowRight },
                ].map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (idx * 0.1) }}
                    onClick={() => setInput(suggestion.text)}
                    className="text-left flex items-start gap-3 p-5 rounded-[24px] bg-white/[0.02] border border-white/5 text-white/60 hover:bg-white/5 hover:text-white hover:border-white/10 transition-all group relative overflow-hidden backdrop-blur-md"
                  >
                    <suggestion.icon className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
                    <span className="text-sm font-medium leading-relaxed">
                      {suggestion.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} w-full`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] px-7 py-5 text-[15px] leading-relaxed relative group overflow-hidden ${message.role === 'user'
                    ? 'bg-white text-black rounded-[24px] rounded-tr-sm font-medium'
                    : 'bg-white/[0.03] backdrop-blur-xl border border-white/10 text-white/90 rounded-[24px] rounded-tl-sm shadow-2xl'
                  }`}
              >
                <div className="whitespace-pre-wrap relative z-10 leading-[1.7]">{renderMessageContent(message.content)}</div>

                {/* Agent Bubble subtle highlight */}
                {message.role === 'agent' && (
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}

                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/10 relative z-10">
                    {message.actions.map((action, i) => (
                      <button
                        key={i}
                        disabled={isProcessing}
                        onClick={async () => {
                          const actionMessages: Record<string, string> = {
                            add_calendar: 'Yes, please schedule this and create calendar events for each task.',
                            execute_plan: 'Execute the plan now. Create all calendar events and set reminders.',
                            modify_plan: 'I want to modify the plan. Show me the adjustments I can make.',
                            accept_plan: 'I accept this plan. Go ahead and schedule everything.',
                            follow_up: 'Tell me more details about this plan.',
                          };
                          const msg = actionMessages[action.type] || `Proceed with: ${action.label}`;
                          const userMsg: ChatMessage = {
                            id: `msg-${Date.now()}`,
                            role: 'user',
                            content: msg,
                            timestamp: new Date(),
                          };
                          addMessage(userMsg);
                          await processUserMessage(msg);
                        }}
                        className="text-sm font-medium text-white bg-white/5 px-5 py-2.5 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {action.label} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={`text-[10px] text-white/30 mt-2 mx-2 font-mono uppercase tracking-widest`}>
                {message.role === 'agent' ? 'NOVA // ' : 'USER // '}
                {(() => {
                  try {
                    const ts = message.timestamp;
                    const date = ts instanceof Date ? ts : new Date(ts as any);
                    return isNaN(date.getTime()) ? '' : date.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    });
                  } catch { return ''; }
                })()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator - Futuristic Style */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start ml-2"
          >
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-full px-5 py-4 flex items-center gap-2 h-[48px]">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white/50"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Bar - Minimalist Floating Pill */}
      <div className="p-6 md:p-8 bg-gradient-to-t from-[#030303] via-[#030303] to-transparent relative z-20">
        <div className="max-w-[800px] mx-auto flex items-end gap-3 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 pr-3 focus-within:border-white/30 focus-within:bg-white/[0.05] transition-all shadow-2xl relative overflow-hidden group">

          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="flex items-center gap-2 relative z-10 mb-0.5 ml-1">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-white/5 hover:bg-white/10 text-white/70 text-[11px] outline-none font-semibold cursor-pointer transition-colors appearance-none text-center px-2 py-1.5 rounded-xl border border-white/10"
              title="Voice Language"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} className="bg-[#111] text-white">
                  {l.label}
                </option>
              ))}
            </select>
            <button
              onClick={toggleListening}
              className={`p-3.5 rounded-full transition-all flex-shrink-0 relative z-10 ${isListening
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              title="Voice input"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Initialize Command..."
            disabled={isProcessing}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder:text-white/30 text-[15px] outline-none disabled:opacity-50 resize-none py-4 px-2 max-h-[120px] min-h-[48px] relative z-10 font-medium"
          />

          <button
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className={`p-4 rounded-full transition-all flex-shrink-0 mb-0.5 relative z-10 ${input.trim() && !isProcessing
                ? 'bg-white text-black hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                : 'bg-white/5 text-white/20'
              }`}
          >
            <Send className="w-5 h-5 translate-x-[-1px] translate-y-[1px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
