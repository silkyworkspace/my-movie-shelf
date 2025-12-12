"use client"

import { useState } from "react"
import { MovieList } from "@/components/movies/MovieList"
import { MovieSearch } from "@/components/movies/MovieSearch"

type Movie = {
  id: string
  title: string
  posterPath: string | null
  releaseDate?: string
  status: "WANT_TO_WATCH" | "WATCHED"
}

export default function DashboardPage() {
  const [wantToWatchMovies, setWantToWatchMovies] = useState<Movie[]>([
    {
      id: "1",
      title: "ショーガール",
      posterPath: "/iZIL64q5E9A2NJBHWzpy0oiPPlA.jpg",
      releaseDate: "1995",
      status: "WANT_TO_WATCH" as const,
    },
    {
      id: "2",
      title: "12モンキーズ",
      posterPath: "/6Sj9wDu3YugthXsU0Vry5XFAZGg.jpg",
      releaseDate: "1995",
      status: "WANT_TO_WATCH" as const,
    },
  ])

  const [watchedMovies] = useState<Movie[]>([
    {
      id: "3",
      title: "爆弾",
      posterPath: "/tFxwqIWAIwgxHVqRNqKV3IW1LH3.jpg",
      releaseDate: "2023",
      status: "WATCHED" as const,
    },
    {
      id: "4",
      title: "エブリシング・エブリウェア・オール・アット・ワンス",
      posterPath: "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
      releaseDate: "2022",
      status: "WATCHED" as const,
    },
  ])

  const handleSelectMovie = (movie: {
    tmdbId: number
    title: string
    posterPath: string | null
    releaseDate: string
  }) => {
    // 一旦「観たいリスト」に追加
    const newMovie: Movie = {
      id: String(movie.tmdbId),
      title: movie.title,
      posterPath: movie.posterPath,
      releaseDate: movie.releaseDate,
      status: "WANT_TO_WATCH",
    }

    setWantToWatchMovies([...wantToWatchMovies, newMovie])
    alert(`「${movie.title}」を観たいリストに追加しました！`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            My Movie Shelf
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <MovieSearch onSelectMovie={handleSelectMovie} />
        <MovieList title="観たいリスト" movies={wantToWatchMovies} />
        <MovieList title="視聴済みリスト" movies={watchedMovies} />
      </main>
    </div>
  )
}