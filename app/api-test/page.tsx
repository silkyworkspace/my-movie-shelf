// データ取得の確認ページ
export default async function ApiTestPage() {
  const apiKey = process.env.TMDB_API_KEY
  const query = "ショーガール"
  
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&language=ja`
  )
  const data = await response.json()

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>TMDb API Test</h1>
      <h2>Query: {query}</h2>
      <pre style={{ background: "#f4f4f4", padding: "20px", overflow: "auto" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}