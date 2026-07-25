import jsPDF from 'jspdf';

export const SCORE_FIELDS = [
  ['technicalScore', 'Technical'],
  ['communicationScore', 'Communication'],
  ['confidenceScore', 'Confidence'],
  ['problemSolvingScore', 'Problem Solving'],
  ['criticalThinkingScore', 'Critical Thinking'],
];

function ScoreBar({ label, value }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-mono text-text2">{label}</span>
        <span className="font-mono text-text0">{value}/100</span>
      </div>
      <div className="h-2 bg-bg2 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function downloadReportPdf(report, config) {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 20;
  let y = 20;

  // jsPDF doesn't auto-paginate — without this, a long summary or a
  // long list of strengths/weaknesses just gets drawn off the bottom
  // of the page and silently disappears from the PDF.
  function ensureSpace(neededHeight = 7) {
    if (y + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = 20;
    }
  }

  doc.setFontSize(18);
  doc.text('InterVue AI — Interview Report', 14, y);
  y += 10;
  doc.setFontSize(11);
  doc.text(`Candidate: ${config?.name || ''}    Role: ${config?.role || ''}    Level: ${config?.experience || ''}`, 14, y);
  y += 12;

  ensureSpace();
  doc.setFontSize(13);
  doc.text('Scores', 14, y); y += 7;
  doc.setFontSize(10);
  SCORE_FIELDS.forEach(([key, label]) => {
    ensureSpace();
    doc.text(`${label}: ${report[key]}/100`, 14, y);
    y += 6;
  });
  y += 4;

  const section = (title, items) => {
    ensureSpace();
    doc.setFontSize(13);
    doc.text(title, 14, y); y += 7;
    doc.setFontSize(10);
    (items || []).forEach((item) => {
      const lines = doc.splitTextToSize(`• ${item}`, 180);
      ensureSpace(lines.length * 5.5);
      doc.text(lines, 14, y);
      y += lines.length * 5.5;
    });
    y += 4;
  };
  section('Strengths', report.strengths);
  section('Areas to Improve', report.weaknesses);
  section('Topics to Review', report.topicsToImprove);

  ensureSpace();
  doc.setFontSize(13);
  doc.text('Summary', 14, y); y += 7;
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(report.overallSummary || '', 180);
  ensureSpace(summaryLines.length * 5.5);
  doc.text(summaryLines, 14, y);

  doc.save(`intervue-ai-report-${(config?.name || 'candidate').replace(/\s+/g, '_')}.pdf`);
}

export default function ReportCard({ report, config, onDownload, footer }) {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-1">Interview Report</h1>
      <p className="text-text1 text-sm mb-8">{config?.name} · {config?.role} · {config?.experience}</p>

      {report.isDemo && (
        <p className="text-accent text-xs mb-6 font-mono">
          SAMPLE REPORT — generated from the scripted demo, not a live-scored interview.
        </p>
      )}
      {report.fallback && !report.isDemo && (
        <p className="text-warn text-xs mb-6">
          Note: AI-written scoring wasn't available for this session, so these scores were derived
          algorithmically from answer verdicts instead.
        </p>
      )}

      <div className="bg-bg1 border border-border0 rounded-l p-6 mb-6">
        {SCORE_FIELDS.map(([key, label]) => (
          <ScoreBar key={key} label={label} value={report[key] ?? 0} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-bg1 border border-border0 rounded-m p-4">
          <p className="font-mono text-[11px] text-good uppercase tracking-wide mb-2">Strengths</p>
          <ul className="text-sm text-text1 space-y-1.5">
            {(report.strengths || []).map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
        <div className="bg-bg1 border border-border0 rounded-m p-4">
          <p className="font-mono text-[11px] text-warn uppercase tracking-wide mb-2">To Improve</p>
          <ul className="text-sm text-text1 space-y-1.5">
            {(report.weaknesses || []).map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
      </div>

      <div className="bg-bg1 border border-border0 rounded-m p-4 mb-8">
        <p className="font-mono text-[11px] text-text2 uppercase tracking-wide mb-2">Summary</p>
        <p className="text-sm text-text1 leading-relaxed">{report.overallSummary}</p>
      </div>

      <div className="flex gap-3 items-center">
        <button
          onClick={onDownload}
          className="font-semibold text-sm px-5 py-3 rounded-s bg-text0 text-bg0 hover:bg-accent transition-all"
        >
          Download PDF
        </button>
        {footer}
      </div>
    </div>
  );
}
