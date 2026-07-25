import { useEffect, useRef } from 'react';

export default function PermissionGate({ media, onGranted, onBack, resumeError }) {
  const { status, errorMessage, stream, request } = media;
  const videoRef = useRef(null);
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    request();
  }, [request]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  function handlePrimaryClick() {
    if (status !== 'granted') { request(); return; }
    // Chrome silently drops any speechSynthesis.speak() call that isn't
    // triggered by a real user gesture — that's why the interviewer's
    // first line used to show as text but never actually get spoken,
    // making it look like the AI was just waiting instead of greeting
    // you. A near-silent utterance fired right inside this click
    // "unlocks" audio for the rest of the session.
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const unlock = new SpeechSynthesisUtterance(' ');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);
    }
    onGranted();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-bg1 border border-border0 rounded-l p-8 animate-rise-in text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-mono text-text2 hover:text-text0 transition-colors mb-6 float-left"
        >
          ← back
        </button>

        <h2 className="font-display text-2xl font-semibold mb-1 mt-8">Camera & microphone check</h2>
        <p className="text-text1 text-sm mb-6">
          InterVue AI is voice-first — we need both to run the interview.
        </p>

        {resumeError && (
          <p className="text-warn text-xs mb-4">
            Couldn't read your resume ({resumeError}) — continuing without it.
          </p>
        )}

        <div className="aspect-[4/3] rounded-m border border-border0 bg-gradient-to-br from-[#1c2f34] to-[#0f1a1d] overflow-hidden mb-5 relative">
          {status === 'granted' ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text2 text-sm">
              {status === 'requesting' && 'Requesting access…'}
              {status === 'idle' && 'Waiting…'}
              {(status === 'denied' || status === 'unsupported') && '⚠'}
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="text-warn text-xs mb-4">{errorMessage}</p>
        )}

        {status === 'granted' && (
          <div className="flex items-center justify-center gap-2 text-good text-xs font-mono mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-good" />
            Camera and microphone connected
          </div>
        )}

        <button
          onClick={handlePrimaryClick}
          className="w-full font-semibold text-sm py-3.5 rounded-s bg-text0 text-bg0 hover:bg-accent transition-all disabled:opacity-50"
          disabled={status === 'requesting'}
        >
          {status === 'granted' ? 'Start interview' : status === 'denied' ? 'Try again' : 'Allow access'}
        </button>
      </div>
    </div>
  );
}
