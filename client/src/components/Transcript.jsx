import TeachingPanel from './TeachingPanel.jsx';

export default function Transcript({ messages, candidateName }) {
  return (
    <div className="slim-scroll flex flex-col gap-3 overflow-y-auto flex-1 pr-1 min-h-0">
      {messages.map((m, i) => (
        <div key={i} className={`flex flex-col ${m.role === 'ai' ? 'items-start' : 'items-end'}`}>
          <span className="font-mono text-[10px] text-text2 mb-1 px-1">
            {m.role === 'ai' ? 'Interviewer AI' : (candidateName || 'John')}
          </span>
          <div
            className={`max-w-[85%] px-4 py-2.5 rounded-m text-sm leading-relaxed shadow-[0_8px_20px_-12px_rgba(0,0,0,0.5)] ${
              m.role === 'ai'
                ? 'bg-bg2 border border-border0 text-text0'
                : 'bg-accent2/10 border border-accent2/25 text-text0'
            }`}
          >
            {m.text}
          </div>
          {/* The explanation and its diagram now live together, right
              under the line that triggered them, instead of the diagram
              floating in a separate part of the page. */}
          {m.teaching && (
            <div className="mt-2 max-w-[85%] w-full">
              <TeachingPanel concept={m.teaching.concept} teachingText={m.teaching.text} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
