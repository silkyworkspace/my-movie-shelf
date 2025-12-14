import { auth } from "@/auth"
import { MovieList } from "@/components/movies/MovieList"
import { MovieSearch } from "@/components/movies/MovieSearch"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

async function getMovies(userEmail: string) {
  // ユーザーを取得
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      userMovies: {
        where: { isDeleted: false }, // 論理削除されていないもののみ
        include: {
          movie: true, // 映画情報も取得
        },
        orderBy: {
          createdAt: "desc", // 新しい順
        },
      },
    },
  })

  if (!user) {
    return { wantToWatch: [], watched: [] }
  }

  // ステータスごとに分ける
  const wantToWatch = user.userMovies
    .filter((um) => um.status === "WANT_TO_WATCH")
    .map((um) => ({
      id: um.movie.id,
      title: um.movie.title,
      posterPath: um.movie.posterPath,
      releaseDate: um.movie.releaseDate,
      status: "WANT_TO_WATCH" as const,
    }))

  const watched = user.userMovies
    .filter((um) => um.status === "WATCHED")
    .map((um) => ({
      id: um.movie.id,
      title: um.movie.title,
      posterPath: um.movie.posterPath,
      releaseDate: um.movie.releaseDate,
      status: "WATCHED" as const,
    }))

  return { wantToWatch, watched }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/")
  }

  const { wantToWatch, watched } = await getMovies(session.user.email)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            My Movie Shelf
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            ようこそ、{session.user.name}さん
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <MovieSearch onSelectMovie={() => { /* 映画追加処理をここに */ }} />
        <MovieList title="観たいリスト" movies={wantToWatch} />
        <MovieList title="視聴済みリスト" movies={watched} />
      </main>
    </div>
  )
}