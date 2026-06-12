import ConnectSampleStorefront from "@/components/connect-sample/ConnectSampleStorefront";

interface PageProps {
  params: Promise<{ accountId: string }>;
}

export default async function ConnectSampleStorefrontPage({ params }: PageProps) {
  const { accountId } = await params;
  return <ConnectSampleStorefront accountId={accountId} />;
}
