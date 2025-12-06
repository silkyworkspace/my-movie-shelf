import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Movie Shelf
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700">
                                ようこそ、{session.user.name}さん
                            </span>
                            <form
                                action={async () => {
                                    "use server";
                                    await signOut({ redirectTo: "/login" });
                                }}
                            >
                                <button
                                    type="submit"
                                    className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                >
                                    ログアウト
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="text-xl font-semibold text-gray-900">
                        ダッシュボード
                    </h2>
                    <p className="mt-2 text-gray-600">
                        認証機能が正常に動作しています！
                    </p>
                    <p className="mt-4 text-sm text-gray-500">
                        次のステップ: 映画検索とリスト管理機能の実装
                    </p>
                </div>
            </main>
        </div>
    );
}