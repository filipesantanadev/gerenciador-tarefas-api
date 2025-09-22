import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import type { Environment } from 'vitest/environments'
import { PrismaClient } from 'generated/prisma/index.js'
import fs from 'node:fs'
import path from 'node:path'

const prisma = new PrismaClient()

function generateDatabaseURL(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable.')
  }

  const url = new URL(process.env.DATABASE_URL)

  url.searchParams.set('schema', schema)

  return url.toString()
}

export default <Environment>{
  name: 'prisma',
  transformMode: 'ssr',
  async setup() {
    const schema = randomUUID()
    const databaseURL = generateDatabaseURL(schema)

    process.env.DATABASE_URL = databaseURL

    execSync('npx prisma db push --force-reset', {
      env: { ...process.env, DATABASE_URL: databaseURL },
      stdio: 'inherit',
    })

    function cleanupPrismaTemporaryFiles() {
      try {
        const prismaDir = path.join(process.cwd(), 'generated/prisma')
        const files = fs.readdirSync(prismaDir)

        files.forEach((file) => {
          if (file.includes('.tmp') && file.includes('query_engine')) {
            fs.unlinkSync(path.join(prismaDir, file))
          }
        })
      } catch (err) {
        // Ignore cleanup errors
      }
    }

    return {
      async teardown() {
        await prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        )
        await prisma.$disconnect()
        cleanupPrismaTemporaryFiles()
      },
    }
  },
}
