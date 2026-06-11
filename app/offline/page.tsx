import Logo from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Offline | ${BRAND_NAME}`,
};

export default function OfflinePage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-sm">
        <Card variant="glass" className="text-center max-w-sm p-8">
          <Logo href="/" variant="icon" className="justify-center mb-6" />
          <h1 className="text-xl font-bold text-white mb-2">You&apos;re offline</h1>
          <p className="text-sb-muted text-sm mb-6 leading-relaxed">
            {BRAND_NAME} needs a connection for live scores and checkout. Reconnect
            and try again.
          </p>
          <Button href="/" variant="primary">
            Retry
          </Button>
        </Card>
      </div>
    </main>
  );
}
