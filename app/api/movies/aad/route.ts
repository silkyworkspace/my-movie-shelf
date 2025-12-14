import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
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
        const { tmdbId, title, posterPath, releaseDate, overview } = body

        // バリデーション
        if (!tmdbId || !title) {
            return NextResponse.json(
                { error: "必須項目が不足しています" },
                { status: 400 }
            )
        }

        // ユーザーを取得または作成
        let user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: session.user.email,
                    name: session.user.name || null,
                },
            })
        }

        // 映画を取得または作成（すでに存在する場合は再利用）
        let movie = await prisma.movie.findUnique({
            where: { tmdbId },
        })

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

        // ユーザーと映画の関連を確認
        const existingUserMovie = await prisma.userMovie.findUnique({
            where: {
                userId_movieId: {
                    userId: user.id,
                    movieId: movie.id,
                },
            },
        })

        if (existingUserMovie) {
            // すでに登録済みの場合
            if (existingUserMovie.isDeleted) {
                // 論理削除されている場合は復活
                await prisma.userMovie.update({
                    where: { id: existingUserMovie.id },
                    data: { isDeleted: false },
                })
            } else {
                return NextResponse.json(
                    { error: "この映画はすでに登録されています" },
                    { status: 400 }
                )
            }
        } else {
            // 新規登録
            await prisma.userMovie.create({
                data: {
                    userId: user.id,
                    movieId: movie.id,
                    status: "WANT_TO_WATCH",
                },
            })
        }

        return NextResponse.json({ success: true, movie })
    } catch (error) {
        console.error("Add movie error:", error)
        return NextResponse.json(
            { error: "映画の登録に失敗しました" },
            { status: 500 }
        )
    }
}