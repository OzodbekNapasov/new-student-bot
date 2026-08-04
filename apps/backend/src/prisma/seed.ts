import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('admin123', 10);
  const leaderPasswordHash = await bcrypt.hash('leader123', 10);

  // 1. Create Super Admin
  await prisma.user.upsert({
    where: { telegramId: '100001' },
    update: {
      email: 'admin@student.uz',
      password: passwordHash,
      role: 'SUPER_ADMIN',
    },
    create: {
      email: 'admin@student.uz',
      firstName: 'Super',
      lastName: 'Admin',
      password: passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      telegramId: '100001',
    },
  });

  // 2. Create Group Leaders
  const leader1 = await prisma.user.upsert({
    where: { telegramId: '200001' },
    update: {
      email: 'rahbar1@student.uz',
      password: leaderPasswordHash,
      role: 'GROUP_LEADER',
    },
    create: {
      email: 'rahbar1@student.uz',
      firstName: 'Bekzod',
      lastName: 'Rahbarov',
      password: leaderPasswordHash,
      role: 'GROUP_LEADER',
      status: 'ACTIVE',
      telegramId: '200001',
    },
  });

  // 3. Create Groups
  const group1 = await prisma.group.upsert({
    where: { code: 'CS-101' },
    update: {
      leaderId: leader1.id,
    },
    create: {
      name: 'Computer Science 101',
      code: 'CS-101',
      faculty: 'Software Engineering',
      academicYear: 2024,
      leaderId: leader1.id,
    },
  });

  // 4. Create Students
  const studentUser1 = await prisma.user.upsert({
    where: { telegramId: '300001' },
    update: {
      email: 'ali@student.uz',
    },
    create: {
      email: 'ali@student.uz',
      firstName: 'Ali',
      lastName: 'Valiyev',
      role: 'STUDENT',
      status: 'ACTIVE',
      telegramId: '300001',
    },
  });

  await prisma.student.upsert({
    where: { userId: studentUser1.id },
    update: {},
    create: {
      userId: studentUser1.id,
      groupId: group1.id,
      studentCardNumber: 'ST-1001',
      gender: 'MALE',
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
