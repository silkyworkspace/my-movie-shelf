"use client" // ← Client Component（ブラウザで実行）

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// インポート
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { MovieSearch } from "@/components/movies/MovieSearch"
import { MovieList } from "@/components/movies/MovieList"
import { useRouter } from "next/navigation"  // Next.js 13+ のRouter

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type Movie = {
    id: string
    title: string
    posterPath: string | null
    releaseDate?: string | null
    status: "WANT_TO_WATCH" | "WATCHED"
}

type DashboardClientProps = {
    userName: string | null | undefined
    wantToWatch: Movie[]  // Server Componentから渡されるデータ
    watched: Movie[]      // Server Componentから渡されるデータ
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// コンポーネント本体
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function DashboardClient({ userName, wantToWatch, watched }: DashboardClientProps) {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Next.js Routerを取得
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const router = useRouter()

    // useRouter() で取得できるメソッド:
    // - router.push('/path')      → ページ遷移
    // - router.back()             → 前のページに戻る
    // - router.refresh()          → 現在のページを再取得（★これを使う）
    // - router.prefetch('/path')  → 事前読み込み

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 映画追加後のハンドラー（★重要★）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const handleMovieAdded = () => {
        router.refresh()

        // router.refresh() の動作:
        // 1. 現在のページのServer Componentを再実行
        // 2. getMovies() が再度実行される
        // 3. DBから最新データを取得
        // 4. 新しいpropsでClient Componentを再レンダリング
        // 5. 画面が自動的に更新される
        //
        // ★ポイント★
        // - ページ遷移は発生しない（URLは変わらない）
        // - スクロール位置も保持される
        // - Client Componentの状態（useState等）も保持される
        // - Server Componentのデータだけが最新になる
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // JSX（画面表示）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ヘッダー */}
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

            {/* メインコンテンツ */}
            <main className="mx-auto max-w-7xl px-4 py-8">
                {/* 検索フォーム */}
                <MovieSearch onMovieAdded={handleMovieAdded} />
                {/* ↑ 映画追加成功時に handleMovieAdded が呼ばれる */}

                {/* 映画リスト */}
                <MovieList title="観たいリスト" movies={wantToWatch} />
                {/* ↑ Server Componentから渡された最新データを表示 */}

                <MovieList title="視聴済みリスト" movies={watched} />
                {/* ↑ Server Componentから渡された最新データを表示 */}
            </main>
        </div>
    )
}