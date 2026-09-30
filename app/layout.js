// app/layout.js
export const metadata = {
  title: "시크릿 노벨",
  description: "인터랙티브 스토리 플랫폼"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, width: "100vw", height: "100dvh", overflow: "hidden", backgroundColor: "#121110" }}>
        {children}
      </body>
    </html>
  );
}
