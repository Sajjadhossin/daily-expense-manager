import 'dotenv/config';
import { PrismaClient } from '../src/generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import WebSocket from 'ws';
import bcrypt from 'bcryptjs';

// Force IPv4 to avoid ETIMEDOUT on systems with unreachable IPv6
class IPv4WebSocket extends WebSocket {
  constructor(url: string, protocols?: string | string[]) {
    super(url, protocols, { family: 4 });
  }
}
neonConfig.webSocketConstructor = IPv4WebSocket;

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  // Income
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: 'bg-emerald-500', isSystem: true, order: 1 },
  { name: 'Business', type: 'income', icon: 'TrendingUp', color: 'bg-blue-500', isSystem: true, order: 2 },
  { name: 'Loan', type: 'income', icon: 'Landmark', color: 'bg-indigo-500', isSystem: true, order: 3 },
  { name: 'Gifts', type: 'income', icon: 'Gift', color: 'bg-pink-500', isSystem: true, order: 4 },
  { name: 'Other', type: 'income', icon: 'PlusCircle', color: 'bg-gray-500', isSystem: true, order: 99 },
  // Expense
  { name: 'Food', type: 'expense', icon: 'Utensils', color: 'bg-orange-500', isSystem: true, order: 1 },
  { name: 'Transport', type: 'expense', icon: 'Car', color: 'bg-yellow-500', isSystem: true, order: 2 },
  { name: 'Rent', type: 'expense', icon: 'Home', color: 'bg-purple-500', isSystem: true, order: 3 },
  { name: 'Bills', type: 'expense', icon: 'FileText', color: 'bg-cyan-500', isSystem: true, order: 4 },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingCart', color: 'bg-rose-500', isSystem: true, order: 5 },
  { name: 'Health', type: 'expense', icon: 'HeartPulse', color: 'bg-red-500', isSystem: true, order: 6 },
  { name: 'Other', type: 'expense', icon: 'MinusCircle', color: 'bg-gray-500', isSystem: true, order: 99 },
];

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Upsert demo user
  console.log('👤 Creating demo user...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@example.com',
      hashedPassword,
    },
  });
  console.log(`   ✓ User: ${user.email} (${user.id})`);

  // 2. Delete existing transactions and categories (transactions reference categories, so delete them first)
  console.log('🧹 Cleaning existing data...');
  const userBooks = await prisma.book.findMany({ where: { userId: user.id }, select: { id: true } });
  if (userBooks.length > 0) {
    await prisma.transaction.deleteMany({ where: { bookId: { in: userBooks.map(b => b.id) } } });
    console.log('   ✓ Cleared existing transactions');
  }

  console.log('🗂️  Seeding categories...');
  await prisma.category.deleteMany({ where: { userId: user.id } });
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map(cat => ({ ...cat, userId: user.id })),
  });
  console.log(`   ✓ Created ${DEFAULT_CATEGORIES.length} categories`);

  // 3. Upsert default book
  console.log('📒 Creating default book...');
  const existingBook = await prisma.book.findFirst({
    where: { userId: user.id, name: 'Personal Wallet' },
  });
  const book = existingBook ?? await prisma.book.create({
    data: {
      name: 'Personal Wallet',
      description: 'My primary daily expenses',
      isDefault: true,
      currency: 'BDT',
      userId: user.id,
    },
  });
  console.log(`   ✓ Book: ${book.name} (${book.id})`);

  // 4. Sample transactions
  console.log('💸 Creating sample transactions...');

  // Fetch category IDs we need
  const categories = await prisma.category.findMany({ where: { userId: user.id } });
  const catByName = (name: string, type: string) =>
    categories.find(c => c.name === name && c.type === type)!;

  const salary = catByName('Salary', 'income');
  const food = catByName('Food', 'expense');
  const transport = catByName('Transport', 'expense');
  const shopping = catByName('Shopping', 'expense');
  const business = catByName('Business', 'income');

  // Clear existing transactions for idempotency
  await prisma.transaction.deleteMany({ where: { bookId: book.id } });

  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - n);

  const transactions = await prisma.transaction.createMany({
    data: [
      {
        type: 'income',
        amount: 50000,
        date: daysAgo(6),
        time: '09:00',
        note: 'Monthly salary',
        bookId: book.id,
        categoryId: salary.id,
      },
      {
        type: 'income',
        amount: 15000,
        date: daysAgo(4),
        time: '11:30',
        note: 'Freelance project payment',
        bookId: book.id,
        categoryId: business.id,
      },
      {
        type: 'expense',
        amount: 850,
        date: daysAgo(3),
        time: '13:15',
        note: 'Lunch at restaurant',
        bookId: book.id,
        categoryId: food.id,
      },
      {
        type: 'expense',
        amount: 1200,
        date: daysAgo(2),
        time: '08:45',
        note: 'Rickshaw and bus fare',
        bookId: book.id,
        categoryId: transport.id,
      },
      {
        type: 'expense',
        amount: 3500,
        date: daysAgo(1),
        time: '17:00',
        note: 'Grocery shopping',
        bookId: book.id,
        categoryId: shopping.id,
      },
    ],
  });
  console.log(`   ✓ Created ${transactions.count} transactions`);

  // Update book balance
  const totalIncome = 50000 + 15000;
  const totalExpense = 850 + 1200 + 3500;
  await prisma.book.update({
    where: { id: book.id },
    data: { balance: totalIncome - totalExpense },
  });
  console.log(`   ✓ Book balance set to ৳${totalIncome - totalExpense}`);

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });