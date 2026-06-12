import AppMenuBar from "@/components/nav/AppMenuBar";

export default function MyGamesLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppMenuBar logoHref="/" />
      {children}
    </>
  );
}
