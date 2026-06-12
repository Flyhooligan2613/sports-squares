interface AmbientBackgroundProps {
  particles?: boolean;
  className?: string;
}

export default function AmbientBackground({
  particles = true,
  className = "",
}: AmbientBackgroundProps) {
  return (
    <>
      {particles ? <div className="sb-xp-particles" aria-hidden /> : null}
      <div className={["sb-xp-glow", className].filter(Boolean).join(" ")} aria-hidden />
      <div className="sb-xp-glow-secondary" aria-hidden />
    </>
  );
}
