"use client";

export default function HomeStagger({
  delay,
  revealed,
  children,
  className = "",
}: {
  delay: number;
  revealed: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        revealed ? "home-stagger home-stagger-active" : "home-stagger",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--home-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
