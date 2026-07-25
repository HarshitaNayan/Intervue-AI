import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATE_LABEL = {
  idle: 'Ready',
  speaking: 'Speaking',
  listening: 'Listening',
  thinking: 'Thinking',
  teaching: 'Explaining',
  ending: 'Session complete',
};

/**
 * Premium head-and-shoulders interviewer bust, built entirely in SVG +
 * Framer Motion (no external avatar service/asset — see README for why,
 * and the upgrade path if a photoreal 3D avatar is wanted later).
 *
 * - Blinks on an independent random timer (alive even when idle)
 * - Idle head sway (very small, continuous — reads as "present", not static)
 * - Mouth openness driven by `mouthLevel` (0-1), which the TTS hook sets
 *   from real speechSynthesis word-boundary events — not a random loop
 * - Eyebrows lift during "teaching" for a warmer, more expressive read
 */
export default function Avatar({ state = 'idle', mouthLevel = 0, size = 220 }) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let timeout;
    function scheduleBlink() {
      timeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        scheduleBlink();
      }, 2400 + Math.random() * 2800);
    }
    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  const isActive = state === 'speaking' || state === 'teaching';
  // idle micro-motion while speaking/teaching gets slightly livelier than pure idle
  const swayDuration = isActive ? 2.6 : 4.5;
  const ringColor = state === 'teaching' ? '#4F8EF7' : state === 'listening' ? '#4CAF7D' : '#4FA89E';
  const browLift = state === 'teaching' ? -3 : state === 'thinking' ? -1.5 : 0;

  // mouth: resting closed line, opens toward an oval as mouthLevel rises;
  // ending state overrides with a fixed gentle smile curve
  const mouthHeight = 2 + mouthLevel * 14;
  const mouthWidth = 22 - mouthLevel * 4;

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div style={{ width: size, height: size * 1.05 }}>
        <svg viewBox="0 0 240 250" width={size} height={size * 1.05}>
          <defs>
            <radialGradient id="headFill" cx="38%" cy="28%" r="80%">
              <stop offset="0%" stopColor="#5a6270" />
              <stop offset="100%" stopColor="#343a44" />
            </radialGradient>
            <linearGradient id="shoulderFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#333844" />
              <stop offset="100%" stopColor="#22252d" />
            </linearGradient>
          </defs>

          {/* ambient rim light — ties the avatar to the spotlight motif
              even at rest, brightening with the active ring color */}
          <ellipse cx="120" cy="96" rx="82" ry="88" fill="none" stroke={ringColor}
            strokeWidth="1" opacity={isActive ? 0.22 : 0.1} />

          <AnimatePresence>
            {(state === 'listening' || state === 'teaching') &&
              [0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx="120" cy="105" r="88"
                  fill="none" stroke={ringColor} strokeWidth="1.5"
                  initial={{ opacity: 0.45, scale: 0.85 }}
                  animate={{ opacity: 0, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
                  style={{ transformOrigin: '120px 105px' }}
                />
              ))}
          </AnimatePresence>

          {/* shoulders — static, anchors the bust */}
          <path d="M 40 250 Q 40 175 90 165 L 150 165 Q 200 175 200 250 Z" fill="url(#shoulderFill)" stroke="#33373f" strokeWidth="1" />

          {/* head + face group — gentle continuous sway */}
          <motion.g
            animate={{ rotate: [-1.2, 1.2, -1.2], y: [0, -2, 0] }}
            transition={{ duration: swayDuration, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '120px 175px' }}
          >
            {/* neck */}
            <rect x="104" y="150" width="32" height="35" rx="8" fill="#282c33" />

            {/* head */}
            <ellipse cx="120" cy="100" rx="58" ry="66" fill="url(#headFill)" stroke="#33373f" strokeWidth="1" />

            {/* hair silhouette */}
            <path d="M 62 90 Q 58 30 120 28 Q 182 30 178 90 Q 178 55 120 52 Q 62 55 62 90 Z" fill="#14161a" />

            {/* eyebrows */}
            {[-24, 24].map((dx) => (
              <motion.rect
                key={dx}
                x={120 + dx - 11} y="78" width="22" height="4" rx="2"
                fill="#0F1113"
                animate={{ y: 78 + browLift }}
                transition={{ duration: 0.4 }}
              />
            ))}

            {/* eyes */}
            {[-24, 24].map((dx) => (
              <motion.ellipse
                key={dx}
                cx={120 + dx} cy="94" rx="6"
                initial={{ ry: 6 }}
                animate={{ ry: blink ? 0.6 : 6 }}
                transition={{ duration: 0.1 }}
                fill="#F3F1EC"
              />
            ))}

            {/* mouth */}
            {state === 'ending' ? (
              <motion.path
                d="M 98 130 Q 120 144 142 130"
                stroke="#F3F1EC" strokeWidth="3.5" fill="none" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }}
              />
            ) : (
              <motion.ellipse
                cx="120" cy="128"
                initial={{ rx: mouthWidth / 2, ry: mouthHeight / 2 }}
                animate={{ rx: mouthWidth / 2, ry: mouthHeight / 2 }}
                transition={{ duration: 0.09 }}
                fill="#15171b"
                stroke="#F3F1EC" strokeWidth="1"
              />
            )}
          </motion.g>

          {/* thinking dots */}
          <AnimatePresence>
            {state === 'thinking' && (
              <g>
                {[0, 1, 2].map((i) => (
                  <motion.circle
                    key={i}
                    cx={95 + i * 25} cy="18" r="4"
                    fill="#4F8EF7"
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </g>
            )}
          </AnimatePresence>
        </svg>
      </div>
      <p className="font-mono text-[11px] tracking-wide text-text2 uppercase">{STATE_LABEL[state]}</p>
    </div>
  );
}
