import { signIn } from "@/auth";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">My Movie Shelf</h1>
                    <p className="mt-2 text-gray-600">
                        映画リストを管理しましょう
                    </p>
                </div>

                <form
                    action={async () => {
                        "use server";
                        await signIn("google", { redirectTo: "/dashboard" });
                    }}
                >
                    <button
                        type="submit"
                        className="w-full rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Googleでログイン
                    </button>
                </form>
            </div>
        </div>
    );
}