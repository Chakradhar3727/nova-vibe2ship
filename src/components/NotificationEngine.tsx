'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/authContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const NOTIFICATION_LEAD_TIME_MINUTES = 5;

// Global AudioContext to avoid browser restrictions inside setInterval
let sharedAudioContext: any = null;

export const initAudio = () => {
  if (!sharedAudioContext) {
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtor) {
      sharedAudioContext = new AudioCtor();
    }
  }
  if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }
};

// Futuristic synthetic notification sound using Web Audio API
export const playNotificationSound = () => {
  try {
    initAudio(); // Ensure it's initialized
    const ctx = sharedAudioContext;
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Sleek ascending ping
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export default function NotificationEngine() {
  const { user } = useAuth();
  const notifiedEvents = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request permission on mount and set up global click listener to init audio
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    const unlockAudio = () => initAudio();
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let pollInterval: NodeJS.Timeout;

    const checkUpcomingEvents = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const token = userSnap.data()?.calendarToken;

        if (!token) return;

        const res = await fetch('/api/calendar/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        const data = await res.json();
        
        if (data.success && data.events) {
          const now = new Date();
          
          data.events.forEach((evt: any) => {
            const startTime = new Date(evt.start.dateTime || evt.start.date);
            const timeDiffMs = startTime.getTime() - now.getTime();
            const minutesUntil = timeDiffMs / 60000;

            // If event is exactly or less than 5 minutes away (and in the future), and we haven't notified yet
            if (minutesUntil > 0 && minutesUntil <= NOTIFICATION_LEAD_TIME_MINUTES) {
              if (!notifiedEvents.current.has(evt.id)) {
                // Mark as notified so we don't spam
                notifiedEvents.current.add(evt.id);

                // Play Sound
                playNotificationSound();

                // Show Browser Notification
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('Nova Alert', {
                    body: `"${evt.summary || 'Upcoming Event'}" starts in ${Math.ceil(minutesUntil)} minutes!`,
                    icon: '/favicon.ico', // Fallback icon
                  });
                } else {
                  console.log(`Nova Alert: ${evt.summary} starts in ${Math.ceil(minutesUntil)} minutes!`);
                }
              }
            }
          });
        } else if (data.error && (data.error.toLowerCase().includes('authentication') || data.error.toLowerCase().includes('credentials'))) {
          // Token expired, warn user once
          if (!notifiedEvents.current.has('auth-warning')) {
            notifiedEvents.current.add('auth-warning');
            playNotificationSound();
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Nova System Alert', {
                body: 'Your Google Calendar connection expired. Please Sign Out and Sign In again to re-enable notifications.',
                icon: '/favicon.ico',
              });
            }
          }
        }
      } catch (err) {
        console.error("NotificationEngine failed to fetch events:", err);
      }
    };

    // Check immediately, then every 60 seconds (Standard Mode)
    checkUpcomingEvents();
    pollInterval = setInterval(checkUpcomingEvents, 60000);

    return () => clearInterval(pollInterval);
  }, [user]);

  // This component doesn't render anything visible in the DOM
  return null;
}
