import { useEffect, useState } from 'react';
import { interviewApi } from '../services/api.js';
import ReportCard, { downloadReportPdf } from '../components/ReportCard.jsx';

export default function ReportView({ sessionId, config, onDone }) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    interviewApi.report(sessionId)
      .then((res) => setReport(res.report))
      .catch((err) => setError(err.message));
  }, [sessionId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-warn text-sm mb-4">Couldn't load the report: {error}</p>
          <button onClick={onDone} className="text-xs font-mono text-text2 hover:text-text0 underline">← back to start</button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-text2">Scoring your interview…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-6 py-14">
      <ReportCard
        report={report}
        config={config}
        onDownload={() => downloadReportPdf(report, config)}
        footer={
          <button onClick={onDone} className="font-mono text-xs text-text2 hover:text-text0 px-3">
            ← back to start
          </button>
        }
      />
    </div>
  );
}
