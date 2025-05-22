export const metadata = {
  title: "Next.js App Router Example",
  description: "A simple example for the NextJS scanner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
