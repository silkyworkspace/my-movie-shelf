"use client"

import Image from "next/image"
import { useState } from "react"

type MovieCardProps = {
    title: string
    posterPath: string | null
    releaseDate?: string | null
    status: "WANT_TO_WATCH" | "WATCHED"
    movieId: string
    onStatusChanged: () => void
}

export default function MovieCard({
    title,
    posterPath,
    releaseDate,
    status,
    movieId,
    onStatusChanged
}: MovieCardProps) {

    const [isUpdating, setIsUpdating] = useState(false)

    // TMDbの画像ベースURL
    const imageBaseUrl = "https://image.tmdb.org/t/p/w500"
    const imageSrc = posterPath ? `${imageBaseUrl}${posterPath}` : "/placeholder-movie.png"

    // ステータス変更処理
    const handleStatusChange = async () => {
        setIsUpdating(true)

        try {
            const newStatus = status === "WATCHED" ? "WANT_TO_WATCH" : "WATCHED"

            const response = await fetch("/api/movies/update-status", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    movieId,
                    newStatus,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "ステータスの更新に失敗しました")
            }

            // 成功時、親コンポーネントに通知
            onStatusChanged()
        } catch (err) {
            alert(err instanceof Error ? err.message : "ステータスの更新に失敗しました")
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
            {/* ポスター画像 */}
            <div className="relative aspect-2/3 w-full overflow-hidden rounded-md bg-gray-200">
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                />
            </div>

            {/* 映画情報 */}
            <div className="mt-3">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                {releaseDate && (
                    <p className="text-sm text-gray-500">{releaseDate}</p>
                )}

                {/* ステータスバッジ */}
                <div className="mt-2">
                    <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${status === "WATCHED"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                    >
                        {status === "WATCHED" ? "視聴済み" : "観たい"}
                    </span>
                </div>

                {/* ステータス変更ボタン */}
                <button
                    onClick={handleStatusChange}
                    disabled={isUpdating}
                    className="mt-3 w-full rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                    {isUpdating ? "更新中..." : status === "WATCHED" ? "観たいに戻す" : "視聴済みにする"}
                </button>
            </div>
        </div>
    )
}