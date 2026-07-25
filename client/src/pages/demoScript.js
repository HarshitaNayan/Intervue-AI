// Fully scripted, deterministic demo — no Gemini, no mic/webcam required.
// Real TTS still speaks each AI line (genuine browser API, just fed
// canned text instead of live Gemini output), so this is a legitimate
// preview of the actual interview experience, not a fake video.
export const DEMO_SCRIPT = [
  { type: 'ai', text: "Hi, I'm your InterVue AI interviewer. Let's start — tell me a bit about a project you're proud of.", avatarState: 'speaking' },
  { type: 'user', text: "I built a task manager app with React and a Node backend. The tricky part was syncing state across tabs in real time." },

  { type: 'ai', text: "Nice — real-time sync across tabs is a good problem. How did you keep tabs in sync — polling, websockets, or something else?", avatarState: 'speaking' },
  { type: 'user', text: "I used the BroadcastChannel API so tabs could message each other directly without hitting the server every time." },

  { type: 'ai', text: "Good instinct reaching for BroadcastChannel instead of polling. Let's shift topics — can you explain how a JavaScript closure works?", avatarState: 'speaking' },
  { type: 'user', text: "Umm... I think it's when a function is inside another function? I don't remember exactly how the scope part works." },

  {
    type: 'teaching',
    concept: 'closures',
    teachingText: "No problem — a closure is just a function that remembers the variables from where it was created, even after that outer function has finished running. So an inner function can keep reading and updating a variable from its parent scope long after the parent call is done.",
    message: "Let's try a simpler angle: if you called that outer function three times, would each call get its own separate copy of that variable, or would they share one?",
    avatarState: 'teaching',
  },
  { type: 'user', text: "Each call would get its own separate copy, since each call creates a new scope." },

  { type: 'ai', text: "Exactly right. One more — what would break if two tabs tried to update the same task at the same time?", avatarState: 'speaking' },
  { type: 'user', text: "You'd get a race condition — whichever update landed last would silently overwrite the other one." },

  { type: 'ai', text: "That's a strong answer. That's a good place to stop for this demo — in a real session we'd continue for another 10-15 minutes covering more of your background and a few more technical questions.", avatarState: 'ending' },
];

export const DEMO_REPORT = {
  technicalScore: 78,
  communicationScore: 82,
  confidenceScore: 70,
  problemSolvingScore: 80,
  criticalThinkingScore: 75,
  strengths: [
    'Chose BroadcastChannel over polling — a genuinely efficient real-time sync approach',
    'Correctly reasoned through closure scoping once given a simpler framing',
    'Identified the race condition risk without prompting',
  ],
  weaknesses: [
    "Definition of closures wasn't solid on the first attempt — worth reviewing scope chains directly",
  ],
  topicsToImprove: ['closures'],
  overallSummary: "This is a sample report generated from the scripted demo above, not a live-scored interview — it shows the same report format you'd get after a real session.",
  fallback: false,
  isDemo: true,
};
