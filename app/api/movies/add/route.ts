// Next.jsのリクエスト・レスポンス型をインポート
import { NextRequest, NextResponse } from "next/server"
// 認証情報を取得する関数をインポート
import { auth } from "@/auth"
// Prismaクライアント（データベース操作用）をインポート
import { prisma } from "@/lib/prisma"

/**
 * POST /api/movies/add
 * 映画をデータベースに登録するAPIエンドポイント
 * 
 * @param request - クライアントからのHTTPリクエスト
 * @returns JSONレスポンス（成功/エラー）
 */
export async function POST(request: NextRequest) {
    try {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ステップ1: 認証チェック
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        // NextAuth.jsの auth() 関数でセッション情報を取得
        const session = await auth()

        // ログインしていない、またはメールアドレスがない場合はエラー
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "ログインが必要です" },
                { status: 401 } // 401 Unauthorized（認証エラー）
            )
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ステップ2: リクエストボディの取得
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        // JSONデータをパース（フロントエンドから送られてきたデータ）
        const body = await request.json()

        // 分割代入で必要なデータを取り出す
        const { tmdbId, title, posterPath, releaseDate, overview } = body

        // フロントエンドから送られてくるデータの例:
        // {
        //   tmdbId: 27205,
        //   title: "インセプション",
        //   posterPath: "/8IB2e4r4oVhHnANbnm7O3Tj6tF8.jpg",
        //   releaseDate: "2010",
        //   overview: "夢の世界を舞台にした..."
        // }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ステップ3: バリデーション（入力チェック）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        // 必須項目が欠けている場合はエラー
        if (!tmdbId || !title) {
            return NextResponse.json(
                { error: "必須項目が不足しています" },
                { status: 400 } // 400 Bad Request（リクエストエラー）
            )
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ステップ4: ユーザーを取得または作成
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        // Prismaで既存のユーザーを検索
        // findUnique = 一意な値（email）で1件だけ検索
        let user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        // ユーザーが見つからない場合は新規作成
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: session.user.email,
                    name: session.user.name || null, // 名前がない場合はnull
                },
            })
        }

        // この時点で user には以下のようなデータが入っている:
        // {
        //   id: "550e8400-e29b-41d4-a716-446655440000",
        //   email: "user@example.com",
        //   name: "山田太郎",
        //   createdAt: 2025-12-14T00:00:00.000Z,
        //   updatedAt: 2025-12-14T00:00:00.000Z
        // }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ステップ5: 映画を取得または作成
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        // TMDb IDで既存の映画を検索
        // 同じ映画が既にDBにあれば、それを再利用する
        let movie = await prisma.movie.findUnique({
            where: { tmdbId },
        })

        // 映画が見つからない場合は新規作成
        if (!movie) {
            movie = await prisma.movie.create({
                data: {
                    tmdbId,
                    title,
                    posterPath,
                    releaseDate,
                    overview,
                },
            })
        }

        // 例: 「インセプション」が既にDBにあれば、それを再利用
        // 他のユーザーも同じ「インセプション」のデータを使う
        // → DBに同じ映画が何個も保存されることを防ぐ

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ステップ6: ユーザーと映画の関連をチェック
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        // UserMovieテーブルで、このユーザーが既にこの映画を登録しているかチェック
        const existingUserMovie = await prisma.userMovie.findUnique({
            where: {
                // 複合ユニークキー（userId + movieId の組み合わせ）で検索
                userId_movieId: {
                    userId: user.id,
                    movieId: movie.id,
                },
            },
        })

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ステップ7: 重複チェックと登録/復活処理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        if (existingUserMovie) {
            // すでに登録済みの場合

            if (existingUserMovie.isDeleted) {
                // 論理削除されている場合は復活させる
                // isDeletedフラグをfalseに戻す
                await prisma.userMovie.update({
                    where: { id: existingUserMovie.id },
                    data: { isDeleted: false },
                })

                // 削除済み → 復活 のケース
                // ユーザーが以前削除したけど、また追加したい場合に対応
            } else {
                // 既に有効な状態で登録されている場合はエラー
                return NextResponse.json(
                    { error: "この映画はすでに登録されています" },
                    { status: 400 }
                )
            }
        } else {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // ステップ8: 新規登録
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            // UserMovieテーブルに新しいレコードを作成
            await prisma.userMovie.create({
                data: {
                    userId: user.id,      // どのユーザーの？
                    movieId: movie.id,    // どの映画の？
                    status: "WANT_TO_WATCH", // デフォルトは「観たい」
                    // isDeletedはデフォルトfalse（schema.prismaで定義済み）
                },
            })

            // この時点でDBには以下のようなレコードが保存される:
            // UserMovie {
            //   id: "uuid-xxx",
            //   userId: "user-uuid",
            //   movieId: "movie-uuid",
            //   status: "WANT_TO_WATCH",
            //   isDeleted: false,
            //   createdAt: 2025-12-14T10:00:00.000Z,
            //   updatedAt: 2025-12-14T10:00:00.000Z
            // }
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ステップ9: 成功レスポンスを返す
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        return NextResponse.json({
            success: true,
            movie // 登録した映画情報を返す
        })

    } catch (error) {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // エラーハンドリング
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        // サーバー側のコンソールにエラーを出力（デバッグ用）
        console.error("Add movie error:", error)

        // クライアントには一般的なエラーメッセージを返す
        return NextResponse.json(
            { error: "映画の登録に失敗しました" },
            { status: 500 } // 500 Internal Server Error（サーバーエラー）
        )
    }
}