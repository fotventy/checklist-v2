const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('12345', 10);
    const user = await prisma.user.create({
      data: {
        username: 'skoptilin',
        password: hashedPassword,
        name: 'skoptilin'
      }
    });
    console.log('Admin user created:', user);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 