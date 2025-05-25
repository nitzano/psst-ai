import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Example usage of Prisma Client
  const users = await prisma.user.findMany({
    include: {
      posts: {
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
    },
  })

  console.log('Users with posts:', JSON.stringify(users, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
