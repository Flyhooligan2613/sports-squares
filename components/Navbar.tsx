import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  return (
    <header className="border-b border-white/[0.06] bg-sb-bg/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <Logo href="/" />
        <Button href="/admin/login" variant="ghost" size="sm" className="min-h-[44px]">
          Host Login
        </Button>
      </div>
    </header>
  );
}
