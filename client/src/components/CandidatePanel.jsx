import { useEffect, useRef } from 'react';

export default function CandidatePanel({ stream, name }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot shrink-0" />
        <span className="font-mono text-[11px] text-text1 truncate">{name || 'Candidate'}</span>
      </div>
      <div className="card overflow-hidden relative min-h-[240px] flex-1">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-bg1 text-text2 text-sm">
            Camera not connected
          </div>
        )}
      </div>
    </div>
  );
}
