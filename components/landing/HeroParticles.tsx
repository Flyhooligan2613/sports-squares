"use client";

export default function HeroParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 7) % 100}%`,
    delay: `${(i % 6) * 1.2}s`,
    duration: `${6 + (i % 4) * 2}s`,
    size: i % 3 === 0 ? 3 : 2,
  }));

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="hero-particle absolute rounded-full bg-sb-glow/30"
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
