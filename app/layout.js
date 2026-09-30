// app/layout.js
export const metadata = {
  title: "시크릿 노벨",
  description: "인터랙티브 추리 & 미연시 플랫폼",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0f172a", display: "flex", justifyContent: "center", minHeight: "100dvh" }}>
        <div style={{ width: "100%", maxWidth: "480px", minHeight: "100dvh", backgroundColor: "#fff", position: "relative", boxShadow: "0 0 40px rgba(0,0,0,0.5)", overflow: "hidden" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
