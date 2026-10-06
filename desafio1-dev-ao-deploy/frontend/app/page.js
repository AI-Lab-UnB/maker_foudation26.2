async function getHealth() {
  const apiUrl = process.env.API_URL || "http://backend:8000/api";
  try {
    const res = await fetch(`${apiUrl}/health/`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`status ${res.status}`);
    }
    return res.json();
  } catch (error) {
    return { status: "erro", items: [], error: error.message };
  }
}

export default async function Home() {
  const data = await getHealth();

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Status da aplicacao</h1>
      <p>
        Status do backend: <strong>{data.status}</strong>
      </p>
      <ul>
        {data.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {data.error && <p style={{ color: "red" }}>Erro: {data.error}</p>}
    </main>
  );
}
