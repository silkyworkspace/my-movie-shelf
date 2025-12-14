"use client" // ← クライアントコンポーネント（ブラウザで実行）

import { useState, useEffect } from "react"
import Image from "next/image"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// TMDb APIから取得する映画データの型
type Movie = {
    tmdbId: number           // TMDb API の映画ID
    title: string            // タイトル
    posterPath: string | null // ポスター画像のパス
    releaseDate: string      // 公開年
    overview?: string        // あらすじ（オプショナル）
}

// このコンポーネントが受け取るpropsの型
type MovieSearchProps = {
    onMovieAdded: () => void  // 映画追加成功時のコールバック関数
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// コンポーネント本体
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function MovieSearch({ onMovieAdded }: MovieSearchProps) {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ステート（状態管理）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const [query, setQuery] = useState("")           // 検索キーワード
    const [results, setResults] = useState<Movie[]>([]) // 検索結果
    const [isLoading, setIsLoading] = useState(false)   // ローディング状態
    const [error, setError] = useState("")              // エラーメッセージ

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 検索処理（デバウンス付き）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    useEffect(() => {
        // 3文字未満なら検索しない
        if (query.trim().length < 3) {
            setResults([])
            setError("")
            return
        }

        setIsLoading(true)
        setError("")

        // 500ms後に検索実行（デバウンス）
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(
                    `/api/movies/search?query=${encodeURIComponent(query)}`
                )
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || "検索に失敗しました")
                }

                setResults(data.movies)
            } catch (err) {
                setError(err instanceof Error ? err.message : "検索に失敗しました")
                setResults([])
            } finally {
                setIsLoading(false)
            }
        }, 500)

        // クリーンアップ（次の入力があったらタイマーキャンセル）
        return () => clearTimeout(timer)
    }, [query])

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 映画をDBに追加する処理（★重要★）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const handleAddMovie = async (movie: Movie) => {
        try {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // ステップ1: API Routeにリクエストを送る
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            const response = await fetch("/api/movies/add", {
                method: "POST",  // HTTPメソッド: POST（データを送信）
                headers: {
                    "Content-Type": "application/json",  // JSONデータを送る
                },
                body: JSON.stringify({
                    // 送信するデータ（映画情報）
                    tmdbId: movie.tmdbId,
                    title: movie.title,
                    posterPath: movie.posterPath,
                    releaseDate: movie.releaseDate,
                    overview: movie.overview,
                }),
            })

            // fetch() が実際に送信するHTTPリクエストの例:
            // POST /api/movies/add HTTP/1.1
            // Content-Type: application/json
            // Cookie: next-auth.session-token=...
            //
            // {
            //   "tmdbId": 27205,
            //   "title": "インセプション",
            //   "posterPath": "/8IB2e4r4oVhHnANbnm7O3Tj6tF8.jpg",
            //   "releaseDate": "2010",
            //   "overview": "夢の世界を舞台にした..."
            // }

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // ステップ2: レスポンスをJSON形式でパース
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            const data = await response.json()

            // 成功時のレスポンス例:
            // {
            //   success: true,
            //   movie: {
            //     id: "uuid-xxx",
            //     tmdbId: 27205,
            //     title: "インセプション",
            //     ...
            //   }
            // }
            //
            // エラー時のレスポンス例:
            // {
            //   error: "この映画はすでに登録されています"
            // }

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // ステップ3: エラーチェック
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            if (!response.ok) {
                // HTTPステータスコードが200番台以外（エラー）
                throw new Error(data.error || "映画の追加に失敗しました")
            }

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // ステップ4: 成功時の処理
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            // ユーザーに成功を通知
            alert(`「${movie.title}」を観たいリストに追加しました！`)

            // 検索窓をクリア
            setQuery("")

            // 検索結果をクリア
            setResults([])

            // 親コンポーネントに通知（重要！）
            onMovieAdded()
            // ↑ これにより、DashboardClient の router.refresh() が呼ばれる
            // → Server Componentが再実行される
            // → DBから最新データを取得
            // → リストに新しい映画が表示される

        } catch (err) {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // エラー時の処理
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            // ユーザーにエラーを通知
            alert(err instanceof Error ? err.message : "映画の追加に失敗しました")
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // JSX（画面表示）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    return (
        <div className="mb-8">
            {/* 検索窓 */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="映画を検索（3文字以上）"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
                {isLoading && (
                    <div className="absolute right-3 top-3 text-gray-400">
                        検索中...
                    </div>
                )}
            </div>

            {/* エラー表示 */}
            {error && (
                <div className="mt-2 text-sm text-red-600">{error}</div>
            )}

            {/* 検索結果リスト */}
            {results.length > 0 && (
                <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border bg-white shadow-lg">
                    {results.map((movie) => (
                        <button
                            key={movie.tmdbId}
                            onClick={() => handleAddMovie(movie)}
                            // ↑ クリック時に handleAddMovie を実行
                            className="flex w-full items-start gap-4 border-b p-4 text-left hover:bg-gray-50"
                        >
                            {/* ポスター画像 */}
                            {movie.posterPath ? (
                                <div className="relative h-24 w-16 shrink-0">
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                                        alt={movie.title}
                                        fill
                                        className="rounded object-cover"
                                        sizes="64px"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded bg-gray-200 text-xs text-gray-500">
                                    画像なし
                                </div>
                            )}

                            {/* 映画情報 */}
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{movie.title}</h3>
                                <p className="text-sm text-gray-500">{movie.releaseDate}</p>
                                {movie.overview && (
                                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                        {movie.overview}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}