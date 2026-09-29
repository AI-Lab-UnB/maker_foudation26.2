export const metadata = {
  title: "Desafio 1 - Do Dev ao Deploy",
  description: "Dashboard de status da aplicacao containerizada",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
