// components/auth/SignInButton.tsx
import { signIn } from "@/auth"

export function SignInButton() {
    return (
        <form
            action={async () => {
                "use server"
                // プロバイダ指定で即 Google ログインさせたい場合
                await signIn("google", { redirectTo: "/" })
                // 何も指定しない場合は /api/auth/signin の画面へ
                // await signIn()
            }}
        >
            <button type="submit">Googleでログイン</button>
        </form>
    )
}