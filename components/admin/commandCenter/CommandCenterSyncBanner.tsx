import Alert from "@/components/ui/Alert";

interface CommandCenterSyncBannerProps {
  hydrating?: boolean;
  usingDemo?: boolean;
  partialMessage?: string | null;
}

export default function CommandCenterSyncBanner({
  hydrating = false,
  usingDemo = false,
  partialMessage = null,
}: CommandCenterSyncBannerProps) {
  if (hydrating) {
    return <Alert variant="info">Refreshing live data…</Alert>;
  }
  if (usingDemo) {
    return (
      <Alert variant="warning">
        Live sync unavailable — showing demo data for reliability.
      </Alert>
    );
  }
  if (partialMessage) {
    return <Alert variant="warning">{partialMessage}</Alert>;
  }
  return null;
}
