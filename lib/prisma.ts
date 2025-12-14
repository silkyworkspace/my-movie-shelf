// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 必要なモジュールのインポート
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Prisma v7のPostgreSQLアダプター（必須）
import { PrismaPg } from "@prisma/adapter-pg"

// Prisma Client本体
// ※ Prisma v7では生成先が変わるので、このパスになる
import { PrismaClient } from "@/app/generated/prisma/client"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// グローバル変数の型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// globalThis = JavaScriptのグローバルオブジェクト
// 開発環境でホットリロード時に、複数のPrismaインスタンスが
// 作られないようにするために使う
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PostgreSQLアダプターの設定（Prisma v7で必須）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const adapter = new PrismaPg({
  // 環境変数からデータベース接続文字列を取得
  connectionString: process.env.DATABASE_URL,
})

// DATABASE_URLの例:
// "postgresql://username:password@hostname:5432/database"
// Neon DBの場合:
// "postgresql://neondb_owner:password@ep-xxx.aws.neon.tech/neondb?sslmode=require"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Prismaインスタンスの作成と管理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const prisma =
  globalForPrisma.prisma ?? // 既に存在すればそれを使う
  new PrismaClient({        // なければ新しく作る
    adapter,                // PostgreSQLアダプターを渡す
  })

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 開発環境でのホットリロード対策
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (process.env.NODE_ENV !== "production") {
  // 開発環境（npm run dev）の場合のみ
  // グローバル変数に保存して再利用
  globalForPrisma.prisma = prisma
}

// 本番環境（Vercel）では、この処理は実行されない
// → 毎回新しいインスタンスが作られる（問題なし）