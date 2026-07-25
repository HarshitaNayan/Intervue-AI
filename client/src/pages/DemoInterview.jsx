import { useEffect, useRef, useState } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js';
import Avatar from '../components/Avatar.jsx';
import Transcript from '../components/Transcript.jsx';
import TeachingPanel from '../components/TeachingPanel.jsx';
import ReportCard, { downloadReportPdf } from '../components/ReportCard.jsx';
import { DEMO_SCRIPT, DEMO_REPORT } from './demoScript.js';

const DEMO_CONFIG = { name: 'Demo Candidate', role: 'Frontend Engineer', experience: '1-2 years' };

export default function DemoInterview({ onExit }) {
  const { speak, cancel, mouthLevel, isSupported: ttsSupported } = useSpeechSynthesis();
  const [messages, setMessages] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [avatarState, setAvatarState] = useState('idle');
  const [teaching, setTeaching] = useState(null);
  const [finished, setFinished] = useState(false);
  // A run id that only ever increases. The previous boolean flag got
  // reset to false on every mount — under React StrictMode's dev-only
  // mount→cleanup→mount cycle, the cleanup's cancel() and the second
  // mount's reset can race: if the cancelled utterance's onend/onerror
  // fires *after* the second mount already reset the flag, run #1's
  // stale callback sees "not stopped" and keeps going in parallel with
  // run #2 — both writing into the same messages array, which is
  // exactly the doubled transcript. Comparing against a ref that never
  // resets closes that race: a stale callback always sees a newer id
  // and bails, no matter the timing.
  const runIdRef = useRef(0);
  const timeoutsRef = useRef([]);

  function trackedTimeout(fn, ms) {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }

  function stopDemo() {
    // Bumping the run id here (not just on mount) is what actually
    // stops speech on Exit — without this, exiting mid-demo cancels the
    // current utterance, but its onend/onerror still fires afterward
    // with the *same* run id that's still "current", so the stale
    // callback doesn't get caught by the guard and goes on to call
    // speak() for the next line anyway. That's the "keeps speaking
    // after Exit" bug.
    runIdRef.current++;
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    cancel();
  }

  useEffect(() => {
    const myRunId = ++runIdRef.current;
    // Deferred rather than called inline: React StrictMode runs
    // mount → cleanup → mount synchronously, all before any timer
    // fires. Calling runStep(0) directly here means BOTH mounts push
    // step 0's message before either can be cancelled — the run-id
    // guard only protects async continuations, not this first
    // synchronous call. Deferring it means only the id that's still
    // current by the time the timer fires actually runs.
    const t = setTimeout(() => runStep(0, myRunId), 0);
    timeoutsRef.current.push(t);
    return () => stopDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runStep(i, runId) {
    if (runId !== runIdRef.current) return;
    if (i >= DEMO_SCRIPT.length) {
      setAvatarState('idle');
      setFinished(true);
      return;
    }
    const step = DEMO_SCRIPT[i];
    setStepIndex(i);

    if (step.type === 'user') {
      setAvatarState('listening');
      trackedTimeout(() => {
        if (runId !== runIdRef.current) return;
        setMessages((prev) => [...prev, { role: 'user', text: step.text }]);
        trackedTimeout(() => runStep(i + 1, runId), 500);
      }, 900);
      return;
    }

    setTeaching(step.type === 'teaching' ? { concept: step.concept, teachingText: step.teachingText } : null);
    setAvatarState(step.avatarState || 'speaking');
    const spoken = step.type === 'teaching' ? `${step.teachingText} ${step.message}` : step.text;
    const displayed = step.type === 'teaching' ? step.message : step.text;
    setMessages((prev) => [...prev, { role: 'ai', text: displayed }]);

    speak(spoken, () => {
      if (runId !== runIdRef.current) return;
      const next = DEMO_SCRIPT[i + 1];
      setAvatarState(step.avatarState === 'ending' ? 'ending' : next && next.type === 'user' ? 'listening' : 'idle');
      runStep(i + 1, runId);
    });
  }

  if (finished) {
    return (
      <div className="min-h-screen max-w-2xl mx-auto px-6 py-14">
        <p className="font-mono text-xs text-accent mb-2">DEMO — sample report</p>
        <ReportCard
          report={DEMO_REPORT}
          config={DEMO_CONFIG}
          onDownload={() => downloadReportPdf(DEMO_REPORT, DEMO_CONFIG)}
          footer={
            <button onClick={onExit} className="font-mono text-xs text-text2 hover:text-text0 px-3">
              ← back to start
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-5">
        <p className="font-mono text-xs text-accent">WATCH DEMO — scripted preview, real speech</p>
        <button onClick={() => { stopDemo(); onExit(); }} className="text-xs font-mono text-text2 hover:text-text0">
          exit demo
        </button>
      </div>

      {!ttsSupported && (
        <p className="text-warn text-xs mb-4">
          Speech synthesis isn't supported in this browser — the demo will still play through as text.
        </p>
      )}

      <div className="bg-bg1 border border-border0 rounded-l flex justify-center py-8 mb-5">
        <Avatar state={avatarState} mouthLevel={mouthLevel} />
      </div>

      {teaching && (
        <TeachingPanel concept={teaching.concept} teachingText={teaching.teachingText} />
      )}

      <Transcript messages={messages} />

      {stepIndex < 0 && <p className="text-text2 text-xs font-mono mt-4">Starting demo…</p>}
    </div>
  );
}
