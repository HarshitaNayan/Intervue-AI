import { useEffect, useRef, useState } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import { interviewApi } from '../services/api.js';
import Transcript from '../components/Transcript.jsx';
import Avatar from '../components/Avatar.jsx';
import CandidatePanel from '../components/CandidatePanel.jsx';

const INTRO_Q1 = (name) =>
  `Hi ${name || 'there'}, thanks for joining. To start, tell me a bit about yourself and what you've been working on recently.`;

export default function InterviewRoom({ config, stream, onEnd, onFinished }) {
  const { speak, isSpeaking, isSupported: ttsSupported, mouthLevel } = useSpeechSynthesis();
  const { start: startListening, stop: stopListening, status: sttStatus,
          interimText, errorMessage: sttError, isSupported: sttSupported } = useSpeechRecognition();

  const [messages, setMessages] = useState([]);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [phase, setPhase] = useState('ai-speaking');
  const [apiError, setApiError] = useState('');
  const [stage, setStage] = useState('intro'); // 'intro' -> 'intro-2' -> 'technical'
  const [sessionId, setSessionId] = useState(null);
  const [finalStats, setFinalStats] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [currentTeaching, setCurrentTeaching] = useState(false);
  const retryRef = useRef(null);

  const hasStarted = useRef(false);
  const typedAnswerRef = useRef('');
  const stageRef = useRef('intro');
  const sessionIdRef = useRef(null);
  // Both intro Q&A pairs get sent to the backend as real transcript
  // context (they used to be dropped entirely — see [[intervue-ai]]).
  const introTranscriptRef = useRef([]);
  useEffect(() => { typedAnswerRef.current = typedAnswer; }, [typedAnswer]);
  useEffect(() => { stageRef.current = stage; }, [stage]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    const q1 = INTRO_Q1(config?.name);
    introTranscriptRef.current.push({ role: 'ai', text: q1 });
    say(q1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  function say(text, opts = {}) {
    setPhase('ai-speaking');
    setCurrentTeaching(!!opts.teaching);
    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        text,
        teaching: opts.teaching ? { concept: opts.teachingConcept || '', text: opts.teachingText || '' } : null,
      },
    ]);
    speak(text, () => {
      setPhase('listening');
      startListening(
        (finalChunk) => {
          setTypedAnswer((prev) => (prev ? prev + ' ' + finalChunk : finalChunk));
        },
        () => {
          // Candidate went quiet after speaking — send the answer on
          // their behalf, no "Done answering" click needed.
          if (typedAnswerRef.current.trim()) submitAnswer(typedAnswerRef.current);
        }
      );
    });
  }

  async function submitAnswer(text) {
    const val = text.trim();
    if (!val) return;
    stopListening();
    setMessages((prev) => [...prev, { role: 'user', text: val }]);
    setTypedAnswer('');
    setApiError('');

    if (stageRef.current === 'intro') {
      introTranscriptRef.current.push({ role: 'user', text: val });
      setStage('intro-2');
      await runIntroFollowUp(val);
      return;
    }

    if (stageRef.current === 'intro-2') {
      introTranscriptRef.current.push({ role: 'user', text: val });
      setStage('technical');
      await runStartTechnical();
      return;
    }

    await runTechnicalAnswer(val);
  }

  async function runIntroFollowUp(val) {
    setPhase('thinking');
    try {
      const { message } = await interviewApi.introFollowUp(config?.name, val);
      introTranscriptRef.current.push({ role: 'ai', text: message });
      say(message);
    } catch (err) {
      // Falls back to a plain question rather than dying — still an
      // upgrade over always being identical, since it at least keeps
      // the interview moving if Gemini has a transient failure here.
      const fallback = 'Thanks for sharing that. What made you interested in this role?';
      introTranscriptRef.current.push({ role: 'ai', text: fallback });
      say(fallback);
    }
  }

  async function runStartTechnical() {
    setPhase('thinking');
    try {
      const res = await interviewApi.start({
        name: config?.name,
        role: config?.role,
        experience: config?.experience,
        difficulty: config?.difficulty,
        resumeSummary: config?.resumeSummary,
        introTranscript: introTranscriptRef.current,
      });
      setSessionId(res.sessionId);
      say(res.message);
    } catch (err) {
      setPhase('error');
      setApiError(err.message);
      retryRef.current = () => runStartTechnical();
    }
  }

  async function runTechnicalAnswer(val) {
    setPhase('thinking');
    try {
      const res = await interviewApi.answer(sessionIdRef.current, val);
      if (res.done) {
        setPhase('done');
        setFinalStats(res.stats);
        setMessages((prev) => [...prev, { role: 'ai', text: res.message }]);
        speak(res.message);
        return;
      }
      const spoken = res.teaching ? `${res.teaching} ${res.message}` : res.message;
      say(spoken, { teaching: !!res.teaching, teachingConcept: res.teachingConcept, teachingText: res.teaching });
    } catch (err) {
      setPhase('error');
      setApiError(err.message);
      retryRef.current = () => runTechnicalAnswer(val);
    }
  }

  const avatarState =
    phase === 'done' ? 'ending'
    : phase === 'ai-speaking' ? (currentTeaching ? 'teaching' : 'speaking')
    : phase === 'listening' ? 'listening'
    : phase === 'thinking' ? 'thinking'
    : 'idle';

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="h-screen flex flex-col w-full px-8 py-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[10.5px] text-white bg-[#EA5A5A]/90 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" /> REC
          </span>
          <span className="font-mono text-xs text-text2">{mm}:{ss}</span>
        </div>
        <button onClick={() => { interviewApi.end(sessionId).catch(() => {}); onEnd(); }}
          className="text-xs font-mono text-text2 hover:text-text0">end interview</button>
      </div>

      {(!ttsSupported || !sttSupported) && (
        <p className="text-warn text-xs mb-3 shrink-0">
          {!sttSupported && "This browser doesn't support speech recognition — use Chrome/Edge, or type answers below. "}
          {!ttsSupported && 'Speech synthesis unsupported in this browser.'}
        </p>
      )}

      {/* Video column stays pinned; only the transcript column scrolls,
          so the interviewer/candidate feed never gets pushed off-screen
          as the conversation grows. */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[400px_1fr] gap-7">
        <div className="slim-scroll flex flex-col gap-4 md:overflow-y-auto md:pr-1">
          <div
            className="card relative flex flex-col items-center justify-center py-7 min-h-[280px]"
          >
            <span className="absolute top-3 left-3 z-10 font-mono text-[10.5px] text-white bg-black/50 px-2 py-1 rounded-full">
              AI Interviewer
            </span>
            <Avatar state={avatarState} mouthLevel={mouthLevel} />
          </div>
          <div className="md:h-[240px]">
            <CandidatePanel stream={stream} name={config?.name} />
          </div>
        </div>


        <div className="flex flex-col min-h-0">
          <Transcript messages={messages} candidateName={config?.name} />

          {phase === 'error' && (
            <div className="mt-4 border border-warn/40 bg-warn/10 rounded-m p-4 text-sm text-warn shrink-0">
              <p className="font-semibold mb-1">Gemini request failed</p>
              <p className="text-xs">{apiError}</p>
              <p className="text-xs mt-2 text-text2">
                This is often a temporary overload on Google's side — try again in a moment.
              </p>
              <button
                onClick={() => retryRef.current?.()}
                className="mt-3 text-xs font-mono px-3 py-1.5 rounded-s border border-warn/50 text-warn hover:bg-warn/10"
              >
                ↻ retry
              </button>
            </div>
          )}

          {phase !== 'done' && phase !== 'error' && (
            <div className="mt-4 pt-4 shrink-0">
              <div className="flex items-center gap-2 mb-2 text-xs font-mono">
                {isSpeaking && <span className="text-accent">● AI speaking…</span>}
                {phase === 'listening' && sttStatus === 'listening' && <span className="text-good">● listening… (sends automatically when you pause)</span>}
                {phase === 'thinking' && <span className="text-text2">● thinking…</span>}
                {sttError && <span className="text-warn">{sttError}</span>}
              </div>

              {interimText && <p className="text-text2 text-sm italic mb-2">"{interimText}"</p>}

              <div className="flex gap-2">
                <input
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitAnswer(typedAnswer)}
                  placeholder="Speak, or type your answer as a fallback…"
                  disabled={phase === 'ai-speaking' || phase === 'thinking'}
                  className="flex-1 bg-bg2 border border-border0 rounded-m px-3.5 py-2.5 text-sm outline-none focus:border-accent disabled:opacity-50"
                />
                <button
                  onClick={() => submitAnswer(typedAnswer)}
                  disabled={phase === 'ai-speaking' || phase === 'thinking' || !typedAnswer.trim()}
                  className="px-4 rounded-s bg-text0 text-bg0 text-sm font-semibold disabled:opacity-40"
                >
                  Send now
                </button>
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="mt-6 text-center shrink-0">
              <p className="text-text1 text-sm mb-2">Interview complete.</p>
              {finalStats && (
                <p className="text-text2 text-xs font-mono mb-4">
                  {finalStats.qCount} questions · topics: {finalStats.topics.join(', ') || 'none'}
                </p>
              )}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => onFinished(sessionId)}
                  className="font-semibold text-sm px-5 py-3 rounded-s bg-text0 text-bg0 hover:bg-accent transition-all"
                >
                  View report
                </button>
                <button onClick={onEnd} className="text-xs font-mono text-text2 hover:text-text0 underline">
                  ← back to start
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
