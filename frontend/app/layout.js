import "./globals.css";

export const metadata = {
  title: "Mini Task Management System",
  description: "Interview project"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
