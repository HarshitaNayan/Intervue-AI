import ParticleNetwork from '../components/ParticleNetwork.jsx';
import AmbientGlow from '../components/AmbientGlow.jsx';

// A soft, glowing rotating polygon accent — solid gradient fill with
// real 3D rotation, closer to the polished look of modern product
// sites than a thin wireframe outline.
function GlowShape({ size = 90, top, left, right, bottom, delay = 0, opacity = 1 }) {
  return (
    <div
      className="absolute pointer-events-none hidden lg:block"
      style={{ top, left, right, bottom, width: size, height: size, opacity, animation: `cube-float 8s ease-in-out ${delay}s infinite` }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '26%',
          background: 'linear-gradient(135deg, rgba(79,142,247,0.55), rgba(79,142,247,0.08))',
          boxShadow: '0 0 60px 10px rgba(79,142,247,0.18)',
          transformStyle: 'preserve-3d',
          animation: `shape-spin 16s ease-in-out ${delay}s infinite`,
        }}
      />
    </div>
  );
}

const FEATURES = [
  { ic: '◆', title: 'Adaptive Interviewing', desc: "Question difficulty and direction shift in real time based on how you're actually performing." },
  { ic: '◐', title: 'Real-Time Conversation', desc: 'No forms, no menus — a natural back-and-forth exchange, like talking to an actual interviewer.' },
  { ic: '◈', title: 'Speech Recognition', desc: 'Answer out loud or by typing. Either way, InterVue AI parses meaning, not just keywords.' },
  { ic: '◇', title: 'Personalized Learning', desc: 'Struggling on a concept triggers a short, targeted explanation before the interview continues.' },
  { ic: '●', title: 'AI Coaching', desc: 'Get pointed feedback on reasoning and communication, not just whether the answer was "right."' },
  { ic: '▣', title: 'Resume-Based Interviews', desc: 'Upload a resume and the question set adapts to your actual projects and stack.' },
  { ic: '▦', title: 'Performance Reports', desc: 'A structured breakdown of strengths, gaps, and what to review before the real thing.' },
  { ic: '▤', title: 'Downloadable Feedback', desc: 'Take the report with you — share it, revisit it, track improvement across sessions.' },
];

const FLOW = [
  { n: 1, title: 'Candidate enters details', desc: 'Name, target role, and difficulty level — used to shape the whole session.' },
  { n: 2, title: 'AI greets the candidate', desc: '1–2 warm-up questions to settle nerves before anything technical begins.' },
  { n: 3, title: 'Adaptive interview begins', desc: '6–10 technical questions, scaled to role and difficulty.', branches: ['strong answer → sharper follow-up', '"I don\'t know" → simpler question'] },
  { n: 4, title: 'AI teaches difficult concepts', desc: 'When a candidate is stuck, a brief explanation before moving on — no dead ends.' },
  { n: 5, title: 'Wrap-up & report', desc: 'A short closing exchange, then a detailed performance report is generated.' },
];

function Nav({ onStart }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg0/70 backdrop-blur-md border-b border-border0">
      <nav className="max-w-[1180px] mx-auto px-8 h-[68px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-display font-semibold text-[19px] tracking-tight">
            <span className="w-[22px] h-[22px] rounded-s bg-gradient-to-br from-accent to-accentDim flex items-center justify-center font-mono text-[11px] font-semibold text-bg0">IV</span>
            InterVue AI
          </div>
          <span className="hidden sm:inline text-[13px] font-bold text-text0 border-l border-border0 pl-3">
            by Harshita Nayan
          </span>
        </div>
        <div className="hidden md:flex items-center gap-9 text-sm text-text1 font-medium">
          <a href="#features" className="hover:text-text0 transition-colors">Features</a>
          <a href="#how" className="hover:text-text0 transition-colors">How It Works</a>
          <a href="#compare" className="hover:text-text0 transition-colors">Why Us</a>
        </div>
        <button onClick={onStart} className="font-semibold text-[13.5px] px-[18px] py-2.5 rounded-s bg-text0 text-bg0 hover:bg-accent hover:-translate-y-px transition-all">
          Start Interview
        </button>
      </nav>
    </header>
  );
}

function HeroMockup() {
  return (
    <div className="mt-18 animate-rise-in">
      <div
        className="rounded-l border border-border0 bg-bg1 overflow-hidden shadow-2xl"
      >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border0 bg-bg2">
        <span className="w-[9px] h-[9px] rounded-full bg-border1" />
        <span className="w-[9px] h-[9px] rounded-full bg-border1" />
        <span className="w-[9px] h-[9px] rounded-full bg-border1" />
        <span className="ml-2 font-mono text-[11.5px] text-text2">intervue.ai/session/2f91</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] min-h-[380px]">
        <div className="border-b md:border-b-0 md:border-r border-border0 p-5 flex flex-col gap-4">
          <div className="aspect-[4/3] rounded-m relative overflow-hidden border border-border0 bg-gradient-to-br from-[#1c2f34] to-[#0f1a1d]">
            <div className="absolute top-3 left-3 flex items-center gap-1.5 font-mono text-[10.5px] text-white bg-black/40 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA5A5A] animate-pulse-dot" /> REC
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[56%] h-[74%] rounded-t-full"
              style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(79,142,247,0.18), transparent 60%)' }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text2">CANDIDATE</span>
            <span className="text-[13px] font-semibold">Harshita N.</span>
          </div>
          <div className="flex items-center justify-between p-3.5 border border-border0 rounded-m bg-bg2">
            <div>
              <span className="font-mono text-xs text-text2 block mb-1">ELAPSED</span>
              <span className="font-mono text-xl text-accent">06:42</span>
            </div>
            <div className="flex-1 ml-5">
              <div className="flex justify-between mb-1.5">
                <span className="font-mono text-xs text-text2">PROGRESS</span>
                <span className="text-[13px] font-semibold">5 / 9</span>
              </div>
              <div className="h-[5px] rounded-full bg-bg3 overflow-hidden">
                <div className="h-full w-[42%] bg-accent rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] rounded-s bg-bg3 border border-border0 flex items-center justify-center font-mono text-xs text-accent">IV</div>
            <div>
              <p className="text-[13.5px] font-semibold">Interviewer</p>
              <p className="text-[11.5px] font-mono text-good">● listening</p>
            </div>
          </div>
          <div className="max-w-[88%] px-3.5 py-2.5 rounded-m rounded-tl-sm text-[13.5px] bg-bg2 border border-border0">
            Good — walk me through why you chose a hash map there instead of sorting first.
          </div>
          <div className="max-w-[88%] ml-auto px-3.5 py-2.5 rounded-m rounded-tr-sm text-[13.5px] bg-accent/10 border border-accent/20">
            Because lookups needed to stay O(1) inside the loop, sorting would've cost me the time budget.
          </div>
          <div className="mt-auto border border-border0 rounded-m p-3.5 bg-bg2">
            <span className="font-mono text-[10.5px] text-accent tracking-wide">FOLLOW-UP · Q6</span>
            <p className="text-[13.5px] text-text1 mt-1.5">Nice. What would break in that approach if the input had duplicate keys?</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default function Landing({ onStart, onWatchDemo }) {
  return (
    <>
      <Nav onStart={onStart} />

      <div className="relative overflow-hidden">
        <ParticleNetwork className="opacity-70" density={45} />
        <div className="relative z-10 pt-48 pb-24 px-8 max-w-[1180px] mx-auto">
        <GlowShape size={64} top="14%" right="6%" delay={0} opacity={0.8} />
        <span className="inline-flex items-center gap-2 font-mono text-xs tracking-wide text-accent bg-accent/10 border border-accent/25 px-3 py-1.5 rounded-full mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
          ADAPTIVE INTERVIEW ENGINE
        </span>

        <h1 className="font-display font-semibold text-[clamp(38px,5.4vw,68px)] leading-[1.06] tracking-tight max-w-3xl text-text0">
          Practice Real Interviews. Build <em className="italic text-accent font-medium">Real</em> Confidence.
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-text1 max-w-xl">
          InterVue AI runs a live, adaptive technical interview — it listens to what you actually say,
          asks sharper follow-ups when you're strong, slows down and teaches when you're stuck, and
          closes with a report you can act on.
        </p>

        <div className="flex items-center gap-4 mt-9 flex-wrap">
          <button onClick={onStart} className="font-semibold text-sm px-6 py-3.5 rounded-s bg-text0 text-bg0 hover:bg-accent transition-all hover:-translate-y-px">
            Start Interview
          </button>
          <button onClick={() => {
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                const unlock = new SpeechSynthesisUtterance(' ');
                unlock.volume = 0;
                window.speechSynthesis.speak(unlock);
              }
              onWatchDemo();
            }} className="flex items-center gap-2.5 font-semibold text-sm px-6 py-3.5 rounded-s border border-border1 hover:border-accent hover:text-accent transition-all">
            <span className="w-[26px] h-[26px] rounded-full border border-border1 flex items-center justify-center text-[10px]">▶</span>
            Watch Demo
          </button>
        </div>

        <HeroMockup />
        </div>
      </div>

      <section id="features" className="relative py-24 px-8 max-w-[1180px] mx-auto overflow-hidden">
        <AmbientGlow className="top-0 right-0 opacity-40" />
        <GlowShape size={44} top="8%" left="2%" delay={0.5} opacity={0.55} />
        <div className="max-w-xl mb-14">
          <span className="font-mono text-xs text-accent tracking-widest uppercase block mb-3">Capabilities</span>
          <h2 className="font-display font-semibold text-[clamp(28px,3.2vw,40px)] leading-tight tracking-tight">
            Everything a real interview needs, none of what it doesn't
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border0 border border-border0 rounded-l overflow-hidden">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-m p-7 border border-border0 bg-bg1 cursor-pointer transition-all duration-200 ease-out hover:bg-accent hover:border-accent hover:-translate-y-1.5 hover:z-10 hover:shadow-[0_24px_44px_-20px_rgba(0,0,0,0.55)]"
            >
              <div className="w-[34px] h-[34px] rounded-s bg-bg3 border border-border0 flex items-center justify-center text-accent text-[15px] mb-4 transition-colors duration-200 group-hover:bg-black/20 group-hover:text-white group-hover:border-white/30">
                {f.ic}
              </div>
              <h3 className="text-[15px] font-semibold mb-2 text-text0 transition-colors duration-200 group-hover:text-white">
                {f.title}
              </h3>
              {/* Collapsed by default, grows open on hover to reveal the
                  description — the content genuinely expands out of the
                  card rather than always sitting there flat. */}
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
                <div className="overflow-hidden">
                  <p className="text-[13.5px] leading-relaxed text-white/85 pt-1">
                    {f.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="relative py-24 px-8 max-w-[1180px] mx-auto overflow-hidden">
        <AmbientGlow className="top-10 left-0 opacity-35" />
        <GlowShape size={50} top="10%" right="4%" delay={1} opacity={0.6} />
        <div className="max-w-xl mb-14">
          <span className="font-mono text-xs text-accent tracking-widest uppercase block mb-3">The session</span>
          <h2 className="font-display font-semibold text-[clamp(28px,3.2vw,40px)] leading-tight tracking-tight mb-4">
            How one interview actually unfolds
          </h2>
          <p className="text-text1 text-base leading-relaxed">
            Roughly 10–15 minutes end to end, depending on how deep the conversation goes.
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-[23px] top-1.5 bottom-1.5 w-px bg-gradient-to-b from-border1 to-transparent" />
          {FLOW.map((step, i) => (
            <div key={step.n} className={`flex gap-6 relative ${i !== FLOW.length - 1 ? 'pb-6' : ''}`}>
              <div className="shrink-0 w-[47px] h-[47px] rounded-full bg-bg1 border border-border1 flex items-center justify-center font-mono text-sm text-accent z-10">
                {step.n}
              </div>
              <div className="group flex-1 rounded-m p-5 border border-transparent cursor-pointer transition-all duration-200 ease-out hover:bg-accent hover:border-accent hover:-translate-x-0 hover:translate-y-[-2px] hover:shadow-[0_20px_36px_-20px_rgba(0,0,0,0.5)]">
                <h3 className="text-base font-semibold mb-1.5 transition-colors duration-200 group-hover:text-white">{step.title}</h3>
                <p className="text-sm text-text2 max-w-md leading-relaxed transition-colors duration-200 group-hover:text-white/85">{step.desc}</p>
                {step.branches && (
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {step.branches.map((b) => (
                      <span key={b} className="font-mono text-[11px] text-text2 border border-dashed border-border1 px-2.5 py-1.5 rounded-s transition-colors duration-200 group-hover:text-white group-hover:border-white/40">{b}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="compare" className="relative py-24 px-8 max-w-[1180px] mx-auto overflow-hidden">
        <ParticleNetwork className="opacity-30" density={30} />
        <GlowShape size={48} top="8%" left="4%" delay={0.3} opacity={0.55} />
        <div className="max-w-xl mb-14">
          <span className="font-mono text-xs text-accent tracking-widest uppercase block mb-3">Why InterVue AI</span>
          <h2 className="font-display font-semibold text-[clamp(28px,3.2vw,40px)] leading-tight tracking-tight">
            Static question banks don't prepare you for a real conversation
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border0 border border-border0 rounded-l overflow-hidden">
          <div className="bg-bg1 border border-border0 rounded-l p-9">
            <h4 className="font-mono text-xs text-text2 tracking-wide uppercase mb-5">Traditional Prep</h4>
            <ul className="flex flex-col gap-3.5">
              {['Static, one-size-fits-all questions', "No explanation when you're wrong", 'No sense of your actual background', 'No feedback beyond a checkmark'].map((t) => (
                <li key={t} className="flex gap-2.5 text-sm text-text1"><span className="text-text2 shrink-0">–</span>{t}</li>
              ))}
            </ul>
          </div>
          <div className="group bg-bg2 border border-border0 rounded-l p-9 cursor-pointer transition-all duration-200 ease-out hover:bg-accent hover:border-accent hover:-translate-y-1.5 hover:shadow-[0_24px_44px_-20px_rgba(0,0,0,0.55)]">
            <h4 className="font-mono text-xs text-accent tracking-wide uppercase mb-5 transition-colors duration-200 group-hover:text-white">InterVue AI</h4>
            <ul className="flex flex-col gap-3.5">
              {['Adaptive questions that respond to you', 'AI coaching in the moment', 'Resume-aware, role-aware interviews', 'Detailed, structured performance reports'].map((t) => (
                <li key={t} className="flex gap-2.5 text-sm text-text0 transition-colors duration-200 group-hover:text-white"><span className="text-good shrink-0 transition-colors duration-200 group-hover:text-white">✓</span>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 px-8 max-w-[1180px] mx-auto">
        <div className="text-center py-24 px-8 rounded-l bg-bg1 border border-border0 relative overflow-hidden">
          <ParticleNetwork className="opacity-40" density={35} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(79,142,247,0.08), transparent 65%)' }} />
          <h2 className="relative font-display font-semibold text-[clamp(28px,3.2vw,40px)] max-w-lg mx-auto mb-4">
            Your next interview shouldn't be the first real one
          </h2>
          <p className="relative text-text1 mb-8">Start a full adaptive session in under a minute.</p>
          <button onClick={onStart} className="relative font-semibold text-sm px-6 py-3.5 rounded-s bg-text0 text-bg0 hover:bg-accent transition-all">
            Start Interview
          </button>
        </div>
      </section>

      <footer className="border-t border-border0 py-10 px-8 max-w-[1180px] mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 font-display font-semibold text-[15px]">
          <span className="w-[22px] h-[22px] rounded-s bg-gradient-to-br from-accent to-accentDim flex items-center justify-center font-mono text-[11px] font-semibold text-bg0">IV</span>
          InterVue AI
        </div>
        <p className="text-[13px] text-text2">Built by Harshita Nayan · practice interviews, not perfect ones.</p>
      </footer>
    </>
  );
}
