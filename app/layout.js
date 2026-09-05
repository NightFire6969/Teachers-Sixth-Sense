import "./globals.css";

export const metadata = {
  title: "Teacher's Sixth Sense",
  description:
    "An AI-powered teaching assistant that helps educators identify potential student misconceptions before a lesson begins.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-ink-800 font-sans antialiased">{children}</body>
    </html>
  );
}
