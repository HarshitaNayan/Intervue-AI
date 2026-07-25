import { CONCEPTS } from '../teachingVisuals/config.js';
import { matchConceptKey } from '../teachingVisuals/matchConcept.js';
import TeachingVisual from './TeachingVisual.jsx';

export default function TeachingPanel({ concept, teachingText }) {
  const key = matchConceptKey(concept);
  const config = key ? CONCEPTS[key] : null;

  if (config) return <TeachingVisual config={config} />;

  // Fallback for a concept Gemini teaches that isn't in the pre-built
  // library — still visually consistent, just text instead of a diagram.
  return (
    <div className="w-full max-w-sm mx-auto bg-bg2 border border-border0 rounded-m p-4">
      <p className="font-mono text-[10px] text-text2 uppercase tracking-wide mb-2">
        {concept ? concept.replace(/_/g, ' ') : 'Quick explanation'}
      </p>
      <p className="text-xs text-text1">{teachingText}</p>
    </div>
  );
}
