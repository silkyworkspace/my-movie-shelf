// components/auth/SignOutButton.tsx
import { signOut } from "@/auth"

export function SignOutButton() {
    return (
        <form
            action={async () => {
                "use server"
                await signOut()
            }}
        >
            <button type="submit">ログアウト</button>
        </form>
    )
}