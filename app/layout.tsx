import "./globals.css";

export const metadata = {
  title: "Galaxy Portfolio",
  description: "Calm. Focused. Systems-driven frontend portfolio."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
