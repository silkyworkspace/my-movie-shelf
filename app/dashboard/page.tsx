import { auth } from "@/auth"
import { MovieList } from "@/components/movies/MovieList"

export default async function DashboardPage() {
  const session = await auth()

  // ダミーデータ
  const wantToWatchMovies = [
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
  ]

  const watchedMovies = [
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
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            My Movie Shelf
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            ようこそ、{session?.user?.name}さん
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <MovieList title="観たいリスト" movies={wantToWatchMovies} />
        <MovieList title="視聴済みリスト" movies={watchedMovies} />
      </main>
    </div>
  )
}
