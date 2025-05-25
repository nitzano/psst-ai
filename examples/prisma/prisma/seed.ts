import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      username: 'john_doe',
      name: 'John Doe',
      role: 'USER',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  // Create tags
  const tag1 = await prisma.tag.create({
    data: {
      name: 'Technology',
      color: '#3B82F6',
    },
  })

  const tag2 = await prisma.tag.create({
    data: {
      name: 'Programming',
      color: '#10B981',
    },
  })

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with Prisma',
      content: 'Prisma is a modern database toolkit...',
      slug: 'getting-started-with-prisma',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: user1.id,
      tags: {
        create: [
          { tagId: tag1.id },
          { tagId: tag2.id },
        ],
      },
    },
  })

  // Create comments
  await prisma.comment.create({
    data: {
      content: 'Great article! Very helpful.',
      authorId: user2.id,
      postId: post1.id,
    },
  })

  // Create likes
  await prisma.like.create({
    data: {
      userId: user2.id,
      postId: post1.id,
    },
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
