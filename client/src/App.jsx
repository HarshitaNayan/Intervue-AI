import { useState } from 'react';
import ApiKeyGate from './components/ApiKeyGate.jsx';
import Landing from './pages/Landing.jsx';
import SetupForm from './components/SetupForm.jsx';
import PermissionGate from './components/PermissionGate.jsx';
import InterviewRoom from './pages/InterviewRoom.jsx';
import ReportView from './pages/ReportView.jsx';
import DemoInterview from './pages/DemoInterview.jsx';
import { interviewApi } from './services/api.js';
import { useMediaDevices } from './hooks/useMediaDevices.js';
import { BUILD_TAG } from './buildInfo.js';

// Stages: landing -> setup -> (resume parsing) -> permissions -> interview -> report
// 'demo' is a fully separate scripted branch reachable from the landing page.
export default function App() {
  const [stage, setStage] = useState('landing');
  const [config, setConfig] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [finishedSessionId, setFinishedSessionId] = useState(null);

  // Requested once in PermissionGate, then the same live stream is reused
  // in InterviewRoom's webcam panel for the whole session — it used to
  // get stopped when PermissionGate unmounted, which silently killed the
  // "keep webcam visible throughout" requirement. Lifting it here fixes that.
  const media = useMediaDevices();

  async function handleSetupSubmit(cfg) {
    const { resumeFile, ...rest } = cfg;
    if (!resumeFile) {
      setConfig(rest);
      setStage('permissions');
      return;
    }
    setStage('parsing-resume');
    setResumeError('');
    try {
      const { resumeSummary } = await interviewApi.uploadResume(resumeFile);
      setConfig({ ...rest, resumeSummary });
      setStage('permissions');
    } catch (err) {
      setResumeError(err.message);
      setConfig(rest);
      setStage('permissions');
    }
  }

  function endAndGoHome() {
    media.stop();
    setStage('landing');
  }

  return (
    <ApiKeyGate>
    <div className="min-h-screen bg-bg0 text-text0">
      {stage === 'landing' && (
        <Landing onStart={() => setStage('setup')} onWatchDemo={() => setStage('demo')} />
      )}

      {stage === 'setup' && (
        <SetupForm onSubmit={handleSetupSubmit} onBack={() => setStage('landing')} />
      )}

      {stage === 'parsing-resume' && (
        <div className="min-h-screen flex items-center justify-center">
          <p className="font-mono text-sm text-text2">Reading your resume…</p>
        </div>
      )}

      {stage === 'permissions' && (
        <PermissionGate
          media={media}
          onGranted={() => setStage('interview')}
          onBack={() => setStage('setup')}
          resumeError={resumeError}
        />
      )}

      {stage === 'interview' && (
        <InterviewRoom
          config={config}
          stream={media.stream}
          onEnd={endAndGoHome}
          onFinished={(sessionId) => { setFinishedSessionId(sessionId); setStage('report'); }}
        />
      )}

      {stage === 'report' && (
        <ReportView
          sessionId={finishedSessionId}
          config={config}
          onDone={endAndGoHome}
        />
      )}

      {stage === 'demo' && (
        <DemoInterview onExit={() => setStage('landing')} />
      )}

      <span className="fixed bottom-2 right-3 font-mono text-[9px] text-text2/50 select-none pointer-events-none">
        {BUILD_TAG}
      </span>
    </div>
    </ApiKeyGate>
  );
}
