"use client"

import { MovieSearch } from "@/components/movies/MovieSearch"
import { MovieList } from "@/components/movies/MovieList"
import { useRouter } from "next/navigation"

type Movie = {
    id: string
    title: string
    posterPath: string | null
    releaseDate?: string | null
    status: "WANT_TO_WATCH" | "WATCHED"
}

type DashboardClientProps = {
    userName: string | null | undefined
    wantToWatch: Movie[]
    watched: Movie[]
}

export function DashboardClient({ userName, wantToWatch, watched }: DashboardClientProps) {
    const router = useRouter()

    const handleMovieAdded = () => {
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Movie Shelf
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        ようこそ、{userName}さん
                    </p>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8">
                <MovieSearch onMovieAdded={handleMovieAdded} />
                <MovieList title="観たいリスト" movies={wantToWatch} />
                <MovieList title="視聴済みリスト" movies={watched} />
            </main>
        </div>
    )
}