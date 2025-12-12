import { NextRequest, NextResponse } from "next/server"

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

// TMDb APIのレスポンス型定義
type TMDbMovie = {
    id: number
    title: string
    poster_path: string | null
    release_date?: string
    overview?: string
}

type TMDbResponse = {
    results: TMDbMovie[]
}

export async function GET(request: NextRequest) {
    try {
        // 1. クエリパラメータから検索キーワードを取得

        // request.nextUrl
        // → リクエストされたURLを表す URLオブジェクト
        // 例：https://example.com/api/search?query=star+wars&page=2
        // .searchParams
        // → そのURLの クエリパラメータ部分だけを扱うためのオブジェクト
        // 型は URLSearchParams
        const searchParams = request.nextUrl.searchParams //リクエストURLにくっついている ?xxx=yyy の部分を、まとめて扱うための searchParams という変数に取り出している

        // searchParams から、特定のクエリパラメータの値を1つ取り出す処理
        // /api/search?query=star+wars&page=2 だった場合、searchParams.get("query")をすると"star wars"を取り出せる
        const query = searchParams.get("query") // URLの ?query=... の値を取り出して、query という変数に入れる

        // 2. クエリが空の場合はエラー
        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: "検索キーワードを入力してください" },
                { status: 400 }
            )
        }

        // 3. TMDb APIに検索リクエスト
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
                query
            )}&language=ja&page=1`
        )

        if (!response.ok) {
            throw new Error("TMDb API request failed")
        }

        const data: TMDbResponse = await response.json()

        // 4. 必要な情報のみを返す形に整形
        const movies = data.results.map((movie) => ({
            tmdbId: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
            releaseDate: movie.release_date?.substring(0, 4) || "", // 年のみ
            overview: movie.overview,
        }))

        // 5. JSON形式でデータを返す
        return NextResponse.json({ movies })
    } catch (error) {
        console.error("Search API Error:", error)
        return NextResponse.json(
            { error: "映画の検索に失敗しました" },
            { status: 500 }
        )
    }
}