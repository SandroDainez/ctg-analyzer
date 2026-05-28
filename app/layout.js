export const metadata = {
  title: "Analisador de CTG",
  description: "Interpretação de cardiotocografia por IA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f5f5f3" }}>
        {children}
      </body>
    </html>
  );
}
