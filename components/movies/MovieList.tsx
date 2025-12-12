import MovieCard from "./MovieCard"

type Movie = {
    id: string
    title: string
    posterPath: string | null
    releaseDate?: string
    status: "WANT_TO_WATCH" | "WATCHED"
}

type MovieListProps = {
    title: string
    movies: Movie[]
}

export function MovieList({ title, movies }: MovieListProps) {
    return (
        <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{title}</h2>

            {movies.length === 0 ? (
                <p className="text-gray-500">まだ映画が登録されていません</p>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {movies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            title={movie.title}
                            posterPath={movie.posterPath}
                            releaseDate={movie.releaseDate}
                            status={movie.status}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}