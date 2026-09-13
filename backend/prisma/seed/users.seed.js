import { hashPassword } from './helpers.js';

export const SEED_USERS = {
  admin: {
    email: 'admin@toyxonahub.uz',
    username: 'admin',
    firstName: 'Alisher',
    lastName: 'Usmonov',
    phone: '+998901110001',
    role: 'ADMIN',
    emailVerified: true,
    password: 'AdminPassword123!',
  },
  owner1: {
    email: 'owner1@toyxonahub.uz',
    username: 'owner_versal',
    firstName: 'Rustam',
    lastName: 'Oripov',
    phone: '+998901110002',
    role: 'OWNER',
    emailVerified: true,
    password: 'OwnerPassword123!',
  },
  owner2: {
    email: 'owner2@toyxonahub.uz',
    username: 'owner_yulduz',
    firstName: 'Bahodir',
    lastName: 'Shamsiyev',
    phone: '+998901110003',
    role: 'OWNER',
    emailVerified: false,
    password: 'OwnerPassword123!',
  },
  user1: {
    email: 'user1@example.com',
    username: 'jasur_k',
    firstName: 'Jasur',
    lastName: 'Karimov',
    phone: '+998909876541',
    role: 'USER',
    emailVerified: true,
    password: 'UserPassword123!',
  },
  user2: {
    email: 'user2@example.com',
    username: 'madina_a',
    firstName: 'Madina',
    lastName: 'Aliyeva',
    phone: '+998909876542',
    role: 'USER',
    emailVerified: true,
    password: 'UserPassword123!',
  },
};

export async function seedUsers(prisma) {
  console.log('👤 Seeding users idempotently...');
  const users = {};

  for (const [key, userData] of Object.entries(SEED_USERS)) {
    const passwordHash = await hashPassword(userData.password);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        phone: userData.phone,
        role: userData.role,
        emailVerified: userData.emailVerified,
      },
      create: {
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        passwordHash,
        role: userData.role,
        emailVerified: userData.emailVerified,
      },
    });

    users[key] = user;
    console.log(`  ✓ User [${userData.role}] ${user.email}`);
  }

  return users;
}
