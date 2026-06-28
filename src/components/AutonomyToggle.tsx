// Autonomy Level Toggle Component
'use client';

import { motion } from 'framer-motion';
import { useAgentStore, AUTONOMY_LEVELS, AutonomyLevel } from '@/store/agentStore';

export default function AutonomyToggle() {
  const { autonomyLevel, setAutonomyLevel } = useAgentStore();

  const levels: AutonomyLevel[] = ['suggest', 'plan', 'execute'];

  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
      {levels.map((level) => {
        const info = AUTONOMY_LEVELS[level];
        const isActive = autonomyLevel === level;

        return (
          <motion.button
            key={level}
            onClick={() => setAutonomyLevel(level)}
            className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive ? 'text-white' : 'text-white/40 hover:text-white/60'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {isActive && (
              <motion.div
                layoutId="autonomy-bg"
                className="absolute inset-0 rounded-md"
                style={{
                  background:
                    level === 'execute'
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : level === 'plan'
                        ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                        : 'linear-gradient(135deg, #F59E0B, #D97706)',
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative flex items-center gap-1">
              {info.icon} {info.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
