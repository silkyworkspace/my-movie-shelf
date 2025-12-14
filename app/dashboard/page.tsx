// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// インポート
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { auth } from "@/auth"                    // 認証
import { prisma } from "@/lib/prisma"            // Prisma Client
import { redirect } from "next/navigation"       // リダイレクト
import { DashboardClient } from "./DashboardClient" // Client Component

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// データベースから映画リストを取得する関数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function getMovies(userEmail: string) {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ステップ1: ユーザーと関連する映画を一括取得
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      // ユーザーに紐づくUserMovieを取得
      userMovies: {
        where: {
          isDeleted: false  // 論理削除されていないもののみ
        },
        include: {
          movie: true,  // UserMovieに紐づくMovieも取得
        },
        orderBy: {
          createdAt: "desc",  // 新しい順に並べる
        },
      },
    },
  })

  // 実行されるSQL（イメージ）:
  // SELECT u.*, um.*, m.*
  // FROM "User" u
  // LEFT JOIN "UserMovie" um ON u.id = um.userId
  // LEFT JOIN "Movie" m ON um.movieId = m.id
  // WHERE u.email = 'user@example.com'
  //   AND um.isDeleted = false
  // ORDER BY um.createdAt DESC

  // 取得されるデータの構造:
  // user = {
  //   id: "user-uuid",
  //   email: "user@example.com",
  //   name: "山田太郎",
  //   userMovies: [
  //     {
  //       id: "usermovie-1",
  //       status: "WANT_TO_WATCH",
  //       movie: {
  //         id: "movie-uuid-1",
  //         title: "インセプション",
  //         posterPath: "/8IB2e...",
  //         releaseDate: "2010"
  //       }
  //     },
  //     {
  //       id: "usermovie-2",
  //       status: "WATCHED",
  //       movie: {
  //         id: "movie-uuid-2",
  //         title: "マトリックス",
  //         ...
  //       }
  //     }
  //   ]
  // }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ステップ2: ユーザーが存在しない場合は空配列を返す
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (!user) {
    return { wantToWatch: [], watched: [] }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ステップ3: ステータスごとに映画を分類
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 「観たい」リスト
  const wantToWatch = user.userMovies
    .filter((um) => um.status === "WANT_TO_WATCH")
    .map((um) => ({
      id: um.movie.id,
      title: um.movie.title,
      posterPath: um.movie.posterPath,
      releaseDate: um.movie.releaseDate,
      status: "WANT_TO_WATCH" as const,
    }))

  // 「視聴済み」リスト
  const watched = user.userMovies
    .filter((um) => um.status === "WATCHED")
    .map((um) => ({
      id: um.movie.id,
      title: um.movie.title,
      posterPath: um.movie.posterPath,
      releaseDate: um.movie.releaseDate,
      status: "WATCHED" as const,
    }))

  // 返り値の例:
  // {
  //   wantToWatch: [
  //     {
  //       id: "movie-uuid-1",
  //       title: "インセプション",
  //       posterPath: "/8IB2e...",
  //       releaseDate: "2010",
  //       status: "WANT_TO_WATCH"
  //     }
  //   ],
  //   watched: [
  //     {
  //       id: "movie-uuid-2",
  //       title: "マトリックス",
  //       posterPath: "/f89U3...",
  //       releaseDate: "1999",
  //       status: "WATCHED"
  //     }
  //   ]
  // }

  return { wantToWatch, watched }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ページコンポーネント（Server Component）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default async function DashboardPage() {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ステップ1: 認証チェック
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const session = await auth()

  // ログインしていない場合はトップページにリダイレクト
  if (!session?.user?.email) {
    redirect("/")
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ステップ2: データベースから映画リストを取得
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const { wantToWatch, watched } = await getMovies(session.user.email)

  // ★重要★
  // この処理は以下のタイミングで実行される:
  // 1. 初回ページ表示時
  // 2. router.refresh() が呼ばれた時
  //
  // つまり、router.refresh() で最新データを再取得できる

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ステップ3: Client Componentにデータを渡す
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return (
    <DashboardClient
      userName={session.user.name}
      wantToWatch={wantToWatch}
      watched={watched}
    />
  )

  // Server Component → Client Component の流れ:
  // 1. Server Componentでデータ取得
  // 2. Client Componentにpropsとして渡す
  // 3. Client ComponentでUIレンダリング
  //
  // この仕組みにより:
  // - データ取得はサーバー側で実行（高速・安全）
  // - UI操作はクライアント側で実行（インタラクティブ）
}