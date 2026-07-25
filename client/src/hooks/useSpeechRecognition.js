import { useCallback, useEffect, useRef, useState } from 'react';

const SpeechRecognitionAPI =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

/**
 * Wraps the Web Speech API's SpeechRecognition.
 * status: 'idle' | 'listening' | 'unsupported' | 'error'
 * Returns interim + final transcript text as the user speaks.
 */
export function useSpeechRecognition() {
  const [status, setStatus] = useState(SpeechRecognitionAPI ? 'idle' : 'unsupported');
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef(null);
  const onFinalRef = useRef(null);
  const onSilenceRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const silenceMsRef = useRef(1600);
  const keepAliveRef = useRef(false); // true while the caller wants listening to continue

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;
    const rec = new SpeechRecognitionAPI();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      if (final) {
        setFinalText((prev) => (prev + ' ' + final).trim());
        onFinalRef.current?.(final.trim());
      }
      setInterimText(interim);

      // Candidate is actively speaking (interim or final text just came
      // in) — (re)start the silence countdown. Once they stop talking for
      // silenceMs with no further speech, auto-submit instead of waiting
      // for a "Done answering" click.
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        onSilenceRef.current?.();
      }, silenceMsRef.current);
    };

    rec.onerror = (event) => {
      // 'no-speech' just means the candidate hasn't started talking yet
      // (a normal pause before answering) — Chrome kills recognition
      // entirely when this happens even with continuous=true. Same for
      // transient 'network'/'aborted' hiccups. Restart silently instead
      // of dead-ending the session with a visible error.
      const recoverable = ['no-speech', 'network', 'aborted'].includes(event.error);
      if (recoverable && keepAliveRef.current) {
        try { recognitionRef.current?.start(); } catch { /* already starting */ }
        return;
      }
      setStatus('error');
      setErrorMessage(
        event.error === 'not-allowed'
          ? 'Microphone access was denied.'
          : `Speech recognition error: ${event.error}`
      );
    };

    rec.onend = () => {
      // Browser stopped recognition on its own (not via our stop()) —
      // bring it back so the candidate is never silently un-listened-to.
      if (keepAliveRef.current) {
        try { recognitionRef.current?.start(); return; } catch { /* ignore */ }
      }
      setStatus((s) => (s === 'listening' ? 'idle' : s));
    };

    recognitionRef.current = rec;
    return () => { keepAliveRef.current = false; rec.stop(); };
  }, []);

  const start = useCallback((onFinalChunk, onSilence, silenceMs = 1600) => {
    if (!recognitionRef.current) return;
    onFinalRef.current = onFinalChunk || null;
    onSilenceRef.current = onSilence || null;
    silenceMsRef.current = silenceMs;
    keepAliveRef.current = true;
    setFinalText('');
    setInterimText('');
    setErrorMessage('');
    try {
      recognitionRef.current.start();
      setStatus('listening');
    } catch {
      // start() throws if already started — ignore
    }
  }, []);

  const stop = useCallback(() => {
    keepAliveRef.current = false;
    clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
    setStatus('idle');
  }, []);

  useEffect(() => () => clearTimeout(silenceTimerRef.current), []);

  return { status, interimText, finalText, errorMessage, start, stop, isSupported: !!SpeechRecognitionAPI };
}
