export default function AmbientGlow({ className = '' }) {
  return (
    <div className={`absolute pointer-events-none ${className}`} aria-hidden="true">
      <div
        className="absolute rounded-full animate-glow-drift"
        style={{
          width: 420, height: 420,
          background: 'radial-gradient(circle, rgba(79,142,247,0.28), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute rounded-full animate-glow-drift"
        style={{
          width: 280, height: 280,
          left: 260, top: 120,
          background: 'radial-gradient(circle, rgba(79,168,158,0.22), transparent 70%)',
          filter: 'blur(36px)',
          animationDelay: '2.5s',
          animationDirection: 'reverse',
        }}
      />
    </div>
  );
}
