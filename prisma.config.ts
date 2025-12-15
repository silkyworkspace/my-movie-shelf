// このファイルは Prisma によって生成されており、以下のものがインストールされていることを前提としています:
// npm install --save-dev prisma dotenv
import { defineConfig, env } from "prisma/config"
import { loadEnvConfig } from "@next/env"

// Next.js と同じルールで .env* を読み込む（.env.local も含む）
loadEnvConfig(process.cwd())

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Prisma CLI（migrate / db push / studio など）が使う接続URL
  datasource: { url: env("DATABASE_URL") },
})
