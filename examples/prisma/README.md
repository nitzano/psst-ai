# Prisma Example

This example demonstrates a Prisma setup with:

- PostgreSQL database provider
- Multiple related models (User, Post, Comment, Tag, Like)
- Enums for UserRole and PostStatus
- Various Prisma features:
  - Relations (one-to-many, many-to-many)
  - Composite primary keys
  - Indexes for performance
  - Default values and functions
  - Custom output path for generated client
  - Seed file for sample data

## Schema Features

- **Users**: User management with roles
- **Posts**: Blog posts with status and publishing
- **Comments**: User comments on posts
- **Tags**: Tagging system with many-to-many relationship
- **Likes**: User likes on posts with composite key

## Commands

- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:studio` - Open Prisma Studio
- `pnpm seed` - Seed the database with sample data
