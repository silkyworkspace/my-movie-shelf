import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          🎬 My Movie Shelf
        </h1>
        <p className="text-xl text-white mb-8">
          あなただけの映画コレクションを管理しよう
        </p>
        <Link
          href="/login"
          className="inline-block rounded-md bg-white px-8 py-3 text-lg font-semibold text-blue-600 hover:bg-gray-100 transition"
        >
          はじめる
        </Link>
      </div>
    </div>
  );
}