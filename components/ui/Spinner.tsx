interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const SIZES = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-10 h-10 border-[3px]",
};

export default function Spinner({
  size = "md",
  label,
  className = "",
}: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className={`${SIZES[size]} border-sb-purple border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label={label ?? "Loading"}
      />
      {label && (
        <p className="text-sb-muted text-sm">{label}</p>
      )}
    </div>
  );
}
