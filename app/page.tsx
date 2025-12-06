// app/page.tsx
import { auth } from "@/auth"
import { SignInButton } from "@/components/auth/SignInButton"
import { SignOutButton } from "@/components/auth/SignOutButton"

export default async function HomePage() {
  const session = await auth()

  return (
    <main style={{ padding: "24px" }}>
      {session?.user ? (
        <>
          <p>{session.user.name} さんとしてログイン中</p>
          <SignOutButton />
        </>
      ) : (
        <>
          <p>ログインしていません</p>
          <SignInButton />
        </>
      )}
    </main>
  )
}