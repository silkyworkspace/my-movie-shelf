import Image from "next/image"

type MovieCardProps = {
    title: string
    posterPath: string | null
    releaseDate?: string
    status: "WANT_TO_WATCH" | "WATCHED"
}

export default function MovieCard({
    title,
    posterPath,
    releaseDate,
    status
}: MovieCardProps) {

    // TMDbの画像ベースURL
    const imageBaseUrl = "https://image.tmdb.org/t/p/w500"
    const imageSrc = posterPath ? `${imageBaseUrl}${posterPath}` : "/placeholder-movie.png"

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
            </div>
        </div>
    )

}
