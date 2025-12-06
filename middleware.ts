import { auth } from "./auth";

export default auth((req) => {
    // ミドルウェアのロジックはauth.config.tsのauthorizedコールバックで処理
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};