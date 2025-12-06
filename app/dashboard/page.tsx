import { auth } from "@/auth"

export default async function DashboardPage() {
    const session = await auth()

    return (
        <main style={{ padding: "24px" }}>
            <h1>ダッシュボード（仮）</h1>
            <p>ログインユーザー：{session?.user?.name ?? "不明"}</p>
        </main>
    )
}