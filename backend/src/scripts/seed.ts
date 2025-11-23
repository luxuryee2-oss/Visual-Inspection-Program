import {prisma} from '../lib/prisma.js';
import bcrypt from 'bcrypt';

async function main() {
  // 기본 사용자 생성 (없는 경우에만)
  const existingUser = await prisma.user.findUnique({
    where: {username: 'inspector1'}
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        username: 'inspector1',
        name: '검사자1',
        password: hashedPassword,
        role: 'inspector'
      }
    });
    console.log('✅ 기본 사용자 생성 완료: inspector1 / password123');
  } else {
    console.log('ℹ️ 기본 사용자가 이미 존재합니다.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

