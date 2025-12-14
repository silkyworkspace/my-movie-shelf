"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

type Movie = {
    tmdbId: number
    title: string
    posterPath: string | null
    releaseDate: string
    overview?: string
}

type MovieSearchProps = {
    onSelectMovie: (movie: Movie) => void // 追加成功時のコールバック
}

export function MovieSearch({ onSelectMovie }: MovieSearchProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Movie[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    // デバウンス処理：入力停止後500msで検索
    useEffect(() => {
        // 3文字未満なら検索しない
        if (query.trim().length < 3) {
            setResults([])
            setError("")
            return
        }

        setIsLoading(true)
        setError("")

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
        }, 500) // 500ms待機

        // クリーンアップ：次の入力があったらタイマーをキャンセル
        return () => clearTimeout(timer)
    }, [query])

    return (
        <div className="mb-8">
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

            {error && (
                <div className="mt-2 text-sm text-red-600">{error}</div>
            )}

            {results.length > 0 && (
                <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border bg-white shadow-lg">
                    {results.map((movie) => (
                        <button
                            key={movie.tmdbId}
                            onClick={() => {
                                onSelectMovie(movie)
                                setQuery("") // 選択後、検索窓をクリア
                                setResults([])
                            }}
                            className="flex w-full items-start gap-4 border-b p-4 text-left hover:bg-gray-50"
                        >
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