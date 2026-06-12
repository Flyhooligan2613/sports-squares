import { Skeleton } from "./Skeleton";

type ExperienceVariant = "action-center" | "live-winners" | "live-tv" | "player";

interface ExperiencePageSkeletonProps {
  variant: ExperienceVariant;
}

function HeroSkeleton() {
  return (
    <div className="text-center mb-8 sm:mb-10 space-y-4">
      <Skeleton className="h-8 w-40 mx-auto rounded-full" />
      <Skeleton className="h-10 w-72 max-w-full mx-auto" />
      <Skeleton className="h-5 w-96 max-w-full mx-auto" />
    </div>
  );
}

export default function ExperiencePageSkeleton({
  variant,
}: ExperiencePageSkeletonProps) {
  if (variant === "live-tv") {
    return (
      <div className="sb-xp-skeleton-fade space-y-4 sm:space-y-6">
        <HeroSkeleton />
        <Skeleton className="sb-xp-skeleton h-56 sm:h-64" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="sb-xp-skeleton h-20" />
          ))}
        </div>
        <div className="grid xl:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            <Skeleton className="sb-xp-skeleton h-40" />
            <Skeleton className="sb-xp-skeleton h-72" />
            <Skeleton className="sb-xp-skeleton h-48" />
          </div>
          <Skeleton className="sb-xp-skeleton h-96 hidden xl:block" />
        </div>
      </div>
    );
  }

  if (variant === "live-winners") {
    return (
      <div className="sb-xp-skeleton-fade space-y-4 sm:space-y-6">
        <HeroSkeleton />
        <Skeleton className="sb-xp-skeleton h-14" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="sb-xp-skeleton h-24" />
          ))}
        </div>
        <Skeleton className="sb-xp-skeleton h-32" />
        <div className="grid xl:grid-cols-3 gap-6">
          <Skeleton className="sb-xp-skeleton h-64 xl:col-span-2" />
          <Skeleton className="sb-xp-skeleton h-64" />
        </div>
        <Skeleton className="sb-xp-skeleton h-48" />
      </div>
    );
  }

  if (variant === "player") {
    return (
      <div className="sb-xp-skeleton-fade max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Skeleton className="sb-xp-skeleton h-44 mb-10" />
        <div className="grid gap-4">
          <Skeleton className="sb-xp-skeleton h-48" />
          <Skeleton className="sb-xp-skeleton h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="sb-xp-skeleton-fade space-y-4 sm:space-y-6">
      <HeroSkeleton />
      <Skeleton className="sb-xp-skeleton h-48" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Skeleton className="sb-xp-skeleton h-40" />
        <Skeleton className="sb-xp-skeleton h-40" />
      </div>
      <Skeleton className="sb-xp-skeleton h-32" />
      <Skeleton className="sb-xp-skeleton h-56" />
    </div>
  );
}
