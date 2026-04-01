import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env['SEED_ADMIN_EMAIL'] ?? 'admin@example.com';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      role: 'admin',
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      userId: admin.id,
      title: 'Welcome conversation',
      messages: {
        create: [
          {
            role: 'system',
            content: 'You are Johnr1sh Copilot, a helpful AI assistant.',
          },
          {
            role: 'assistant',
            content: 'Hello! How can I help you today?',
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded admin user: ${admin.email}`);
  console.log(`✅ Seeded conversation: ${conversation.id}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
