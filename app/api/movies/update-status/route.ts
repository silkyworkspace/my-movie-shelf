import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest) {
    try {
        // 認証チェック
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "ログインが必要です" },
                { status: 401 }
            )
        }

        // リクエストボディを取得
        const body = await request.json()
        const { movieId, newStatus } = body

        // バリデーション
        if (!movieId || !newStatus) {
            return NextResponse.json(
                { error: "必須項目が不足しています" },
                { status: 400 }
            )
        }

        // ステータスの値チェック
        if (newStatus !== "WANT_TO_WATCH" && newStatus !== "WATCHED") {
            return NextResponse.json(
                { error: "無効なステータスです" },
                { status: 400 }
            )
        }

        // ユーザーを取得
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            )
        }

        // UserMovieを更新
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

        // ステータスを更新
        await prisma.userMovie.update({
            where: { id: userMovie.id },
            data: { status: newStatus },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Update status error:", error)
        return NextResponse.json(
            { error: "ステータスの更新に失敗しました" },
            { status: 500 }
        )
    }
}