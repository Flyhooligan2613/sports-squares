export default function HeroBackground() {
  return (
    <div className="hero-bg absolute inset-0 overflow-hidden pointer-events-none bg-sb-bg" aria-hidden>
      <div className="hero-showcase-gradient absolute inset-0" />

      {/* Soft top blend under site navbar */}
      <div className="hero-showcase-top-fade absolute inset-x-0 top-0 h-28 sm:h-32" />

      {/* Fade into page content below hero */}
      <div className="hero-showcase-bottom-fade absolute bottom-0 left-0 right-0 h-40 sm:h-52" />
    </div>
  );
}
