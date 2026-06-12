import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";

export default function ConnectSampleSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <LandingGlassCard glow className="p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Payment successful</h1>
        <p className="text-sb-muted text-sm mb-6">
          This was a direct charge on the connected account with a platform application fee.
        </p>
        <Link href="/connect-sample" className="text-emerald-400 hover:underline text-sm">
          Back to Connect sample dashboard
        </Link>
      </LandingGlassCard>
    </div>
  );
}
