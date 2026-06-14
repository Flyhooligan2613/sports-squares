interface AmbientBackgroundProps {
  particles?: boolean;
  className?: string;
  /** Pin glow to the viewport so it covers the full screen while scrolling */
  fixed?: boolean;
}

export default function AmbientBackground({
  particles = true,
  className = "",
  fixed = false,
}: AmbientBackgroundProps) {
  const layerClass = fixed ? "sb-xp-layer-fixed" : "sb-xp-layer";

  return (
    <div className={layerClass} aria-hidden>
      {particles ? <div className="sb-xp-particles" /> : null}
      <div className={["sb-xp-glow", className].filter(Boolean).join(" ")} />
      <div className="sb-xp-glow-secondary" />
    </div>
  );
}
