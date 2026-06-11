"use client";

export default function HeroParticles() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${(i * 13 + 9) % 100}%`,
    delay: `${(i % 8) * 1.5}s`,
    duration: `${10 + (i % 5) * 3}s`,
    size: i % 4 === 0 ? 3 : 2,
  }));

  return (
    <div
      className="hero-parallax-fast absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="hero-particle hero-particle-slow absolute rounded-full bg-sb-glow/25"
          style={{
            left: p.left,
            bottom: "-10%",
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
