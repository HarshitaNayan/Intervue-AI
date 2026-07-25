import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeachingVisual({ config }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setStepIndex(0);
    if (!config || config.steps.length < 2) return;
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % config.steps.length);
    }, 1900);
    return () => clearInterval(interval);
  }, [config]);

  if (!config) return null;
  const step = config.steps[stepIndex];
  const visible = step.visibleIds || config.nodes.map((n) => n.id);
  const active = new Set(step.activeIds || []);
  const activeEdges = new Set(step.activeEdgeIds || []);
  const nodeById = Object.fromEntries(config.nodes.map((n) => [n.id, n]));

  return (
    <div className="w-full max-w-sm mx-auto bg-bg2 border border-border0 rounded-m p-4">
      <p className="font-mono text-[10px] text-text2 uppercase tracking-wide mb-2">{config.title}</p>
      <svg viewBox="0 0 280 150" width="100%" height="140">
        {config.edges?.map((e) => {
          const a = nodeById[e.from];
          const b = nodeById[e.to];
          if (!a || !b || !visible.includes(a.id) || !visible.includes(b.id)) return null;
          const edgeId = e.id || `${e.from}-${e.to}`;
          const isActive = activeEdges.has(edgeId);
          return (
            <line
              key={edgeId}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isActive ? '#4F8EF7' : '#33373f'}
              strokeWidth={isActive ? 2 : 1.3}
            />
          );
        })}
        <AnimatePresence>
          {config.nodes
            .filter((n) => visible.includes(n.id))
            .map((n) => {
              const isActive = active.has(n.id);
              return (
                <motion.g
                  key={n.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  {n.shape === 'circle' ? (
                    <circle
                      cx={n.x} cy={n.y} r={n.r || 16}
                      fill={isActive ? 'rgba(79,142,247,0.18)' : '#191c21'}
                      stroke={isActive ? '#4F8EF7' : '#33373f'}
                      strokeWidth={isActive ? 2 : 1.3}
                    />
                  ) : (
                    <rect
                      x={n.x - (n.w || 44) / 2} y={n.y - (n.h || 24) / 2}
                      width={n.w || 44} height={n.h || 24} rx="5"
                      fill={isActive ? 'rgba(79,142,247,0.18)' : '#191c21'}
                      stroke={isActive ? '#4F8EF7' : '#33373f'}
                      strokeWidth={isActive ? 2 : 1.3}
                    />
                  )}
                  <text
                    x={n.x} y={n.y + 3.5} textAnchor="middle" fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    fill={isActive ? '#F3F1EC' : '#B7BAC2'}
                  >
                    {n.label}
                  </text>
                </motion.g>
              );
            })}
        </AnimatePresence>
      </svg>
      <p className="text-xs text-text1 mt-1 min-h-[32px]">{step.caption}</p>
    </div>
  );
}
