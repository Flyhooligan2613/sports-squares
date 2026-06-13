import PlayerAuthBootstrap from "@/components/player/PlayerAuthBootstrap";
import PlayerShell from "@/components/player/PlayerShell";
import { createClient } from "@/lib/supabase/server";

export default async function MyGamesDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PlayerShell userEmail={user?.email ?? undefined}>
      <PlayerAuthBootstrap />
      {children}
    </PlayerShell>
  );
}
