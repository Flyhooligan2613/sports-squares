import { cn } from "../utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({
  width = "100%",
  height = 16,
  rounded = false,
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("sqds-skeleton", className)}
      style={{
        width,
        height,
        borderRadius: rounded ? "var(--sqds-radius-pill)" : undefined,
        ...style,
      }}
      aria-hidden
      {...props}
    />
  );
}

export function Spinner({ className }: { className?: string }) {
  return <div className={cn("sqds-spinner", className)} role="status" aria-label="Loading" />;
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn("sqds-loading-card", className)}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={32} width="40%" />
      <Skeleton height={12} />
      <Skeleton height={12} width="80%" />
    </div>
  );
}
