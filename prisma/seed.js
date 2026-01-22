const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminUsername = 'admin';
  const adminPassword = 'admin123'; // Anda harus mengubah ini di produksi

  const existingAdmin = await prisma.users.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.users.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('Default admin user created.');
    console.log(`-> Username: ${adminUsername}`);
    console.log(`-> Password: ${adminPassword} (Use this for the first login)`);
  } else {
    console.log('Admin user already exists.');
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