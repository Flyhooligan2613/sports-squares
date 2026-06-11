"use client";

export default function HeroParticles() {
  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: `${(i * 15 + 11) % 100}%`,
    delay: `${(i % 5) * 2}s`,
    duration: `${14 + (i % 4) * 4}s`,
    size: i % 3 === 0 ? 2 : 1,
  }));

  return (
    <div
      className="hero-parallax-fast absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="hero-particle absolute rounded-full bg-sb-glow/20"
          style={{
            left: p.left,
            bottom: "-8%",
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
