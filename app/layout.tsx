import "./globals.css";

export const metadata = {
  title: "Galaxy Experience",
  description: "A live 3D astronomical experience"
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
