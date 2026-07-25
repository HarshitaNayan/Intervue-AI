import { useState } from 'react';

const ROLES = [
  'Frontend Engineer', 'Backend Engineer', 'Full-Stack Engineer', 'Mobile Engineer (Android/iOS)',
  'Data Scientist', 'Data Analyst', 'Data Engineer', 'Machine Learning Engineer', 'AI/ML Engineer',
  'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Engineer', 'QA/Test Engineer',
  'Product Manager', 'Business Analyst', 'UI/UX Designer', 'Cybersecurity Analyst',
  'Embedded Systems Engineer', 'Database Administrator', 'Technical Support Engineer',
];
const EXPERIENCE = ['Fresher / Student', '1-2 years', '3-5 years', '5+ years'];
const DIFFICULTY = ['easy', 'medium', 'advanced'];

export default function SetupForm({ onSubmit, onBack }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [experience, setExperience] = useState(EXPERIENCE[0]);
  const [difficulty, setDifficulty] = useState('medium');
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState('');

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const okTypes = ['application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!okTypes.includes(f.type) && !/\.(pdf|docx?|txt)$/i.test(f.name)) {
      setError('Please upload a PDF, DOC/DOCX, or TXT file.');
      return;
    }
    setError('');
    setResumeFile(f);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!role.trim()) { setError('Please enter a target role.'); return; }
    onSubmit({ name: name.trim(), role: role.trim(), experience, difficulty, resumeFile });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-bg1 border border-border0 rounded-l p-8 animate-rise-in"
      >
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-mono text-text2 hover:text-text0 transition-colors mb-6"
        >
          ← back
        </button>

        <h2 className="font-display text-2xl font-semibold mb-1">Set up your interview</h2>
        <p className="text-text1 text-sm mb-7">Takes 30 seconds. You can change these later.</p>

        <label className="block text-xs font-mono text-text2 mb-2">Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full bg-bg2 border border-border0 rounded-m px-3.5 py-2.5 text-sm text-text0 placeholder:text-text2 outline-none focus:border-accent transition-colors mb-5"
        />

        <label className="block text-xs font-mono text-text2 mb-2">Target role</label>
        <input
          list="role-suggestions"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Type any role — e.g. Product Manager, QA Engineer…"
          className="w-full bg-bg2 border border-border0 rounded-m px-3.5 py-2.5 text-sm text-text0 placeholder:text-text2 outline-none focus:border-accent transition-colors mb-5"
        />
        <datalist id="role-suggestions">
          {ROLES.map((r) => <option key={r} value={r} />)}
        </datalist>

        <label className="block text-xs font-mono text-text2 mb-2">Experience level</label>
        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="w-full bg-bg2 border border-border0 rounded-m px-3.5 py-2.5 text-sm text-text0 outline-none focus:border-accent transition-colors mb-5"
        >
          {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>

        <label className="block text-xs font-mono text-text2 mb-2">Difficulty</label>
        <div className="flex gap-2 mb-5">
          {DIFFICULTY.map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 capitalize text-xs font-semibold py-2.5 rounded-s border transition-colors ${
                difficulty === d
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'bg-bg2 border-border0 text-text1 hover:border-border1'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <label className="block text-xs font-mono text-text2 mb-2">Resume (optional)</label>
        <label className="flex items-center justify-between w-full bg-bg2 border border-dashed border-border1 rounded-m px-3.5 py-3 text-sm text-text2 cursor-pointer hover:border-accent transition-colors mb-2">
          <span className="truncate">{resumeFile ? resumeFile.name : 'Upload PDF, DOCX, or TXT'}</span>
          <span className="text-accent text-xs font-mono ml-2 shrink-0">Browse</span>
          <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFile} className="hidden" />
        </label>
        <p className="text-[11px] text-text2 mb-5">
          If uploaded, questions will be tailored to your projects and skills.
        </p>

        {error && <p className="text-warn text-xs mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full font-semibold text-sm py-3.5 rounded-s bg-text0 text-bg0 hover:bg-accent transition-all"
        >
          Continue to camera & mic check
        </button>
      </form>
    </div>
  );
}
