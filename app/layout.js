// app/layout.js
export const metadata = {
  title: "도파",
  description: "잉크 한 방울로 터지는 도파민 AI 롤플레잉",
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
