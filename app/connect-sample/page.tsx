import ConnectSampleDashboard from "@/components/connect-sample/ConnectSampleDashboard";

export const metadata = {
  title: "Stripe Connect Sample | SquareBoards",
  description: "Sample Stripe Connect v2 integration — onboarding, products, storefront, subscriptions.",
};

interface PageProps {
  searchParams: Promise<{ accountId?: string; connect?: string }>;
}

export default async function ConnectSamplePage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <ConnectSampleDashboard initialAccountId={params.accountId ?? null} />;
}
