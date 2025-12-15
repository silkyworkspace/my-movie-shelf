// Next.jsのリクエスト・レスポンス型をインポート
import { NextRequest, NextResponse } from "next/server"
// 認証情報を取得する関数をインポート
import { auth } from "@/auth"
// Prismaクライアント（データベース操作用）をインポート
import { prisma } from "@/lib/prisma"

// HTTPメソッドで PATCH は、一部だけ更新
export async function PATCH(request: NextRequest) {
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
        const { movieId } = body

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ステップ3: バリデーション（入力チェック）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        if (!movieId) {
            return NextResponse.json(
                { error: "映画IDが必要です" },
                { status: 400 } // 400 Bad Request（リクエストエラー）
            )
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ステップ4: ユーザーを取得または作成
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        // Prismaで既存のユーザーを検索
        // findUnique = 一意な値（email）で1件だけ検索
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            )
        }

        // UserMovieを検索
        const userMovie = await prisma.userMovie.findFirst({
            where: {
                userId: user.id,
                movieId: movieId,
                isDeleted: false,
            },
        })

        if (!userMovie) {
            return NextResponse.json(
                { error: "映画が見つかりません" },
                { status: 404 }
            )
        }

        // 論理削除（isDeletedをtrueに更新）
        await prisma.userMovie.update({
            where: { id: userMovie.id },
            data: { isDeleted: true },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete movie error:", error)
        return NextResponse.json(
            { error: "映画の削除に失敗しました" },
            { status: 500 }
        )
    }
}