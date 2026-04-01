const mongoose = require('mongoose');
const config = require('./config/config');
const { User, FinancialRecord, TokenBlacklist } = require('./models');

const seedData = {
  users: [
    { email: 'admin@financedashboard.com', password: 'Admin@123', name: 'System Administrator', role: 'admin', isActive: true },
    { email: 'analyst@financedashboard.com', password: 'Analyst@123', name: 'Financial Analyst', role: 'analyst', isActive: true },
    { email: 'viewer@financedashboard.com', password: 'Viewer@123', name: 'Dashboard Viewer', role: 'viewer', isActive: true }
  ],
  records: [
    { type: 'income', category: 'Salary', amount: 7500, date: new Date('2026-01-01'), notes: 'January salary', description: 'Monthly salary payment' },
    { type: 'income', category: 'Salary', amount: 7500, date: new Date('2026-02-01'), notes: 'February salary', description: 'Monthly salary payment' },
    { type: 'income', category: 'Salary', amount: 7500, date: new Date('2026-03-01'), notes: 'March salary', description: 'Monthly salary payment' },
    { type: 'income', category: 'Freelance', amount: 2500, date: new Date('2026-01-15'), notes: 'Website project', description: 'Client website redesign' },
    { type: 'income', category: 'Freelance', amount: 1800, date: new Date('2026-02-20'), notes: 'Mobile consultation', description: 'Technical consulting' },
    { type: 'income', category: 'Investment', amount: 500, date: new Date('2026-01-25'), notes: 'Dividends', description: 'Quarterly stock dividends' },
    { type: 'income', category: 'Investment', amount: 500, date: new Date('2026-02-25'), notes: 'Dividends', description: 'Quarterly stock dividends' },
    { type: 'income', category: 'Bonus', amount: 2000, date: new Date('2026-02-15'), notes: 'Performance bonus', description: 'Annual performance bonus' },
    { type: 'expense', category: 'Rent', amount: 1500, date: new Date('2026-01-01'), notes: 'January rent', description: 'Monthly apartment rent' },
    { type: 'expense', category: 'Rent', amount: 1500, date: new Date('2026-02-01'), notes: 'February rent', description: 'Monthly apartment rent' },
    { type: 'expense', category: 'Rent', amount: 1500, date: new Date('2026-03-01'), notes: 'March rent', description: 'Monthly apartment rent' },
    { type: 'expense', category: 'Groceries', amount: 350, date: new Date('2026-01-10'), notes: 'Weekly groceries', description: 'Food shopping' },
    { type: 'expense', category: 'Groceries', amount: 380, date: new Date('2026-01-24'), notes: 'Weekly groceries', description: 'Food shopping' },
    { type: 'expense', category: 'Groceries', amount: 420, date: new Date('2026-02-07'), notes: 'Weekly groceries', description: 'Food shopping' },
    { type: 'expense', category: 'Groceries', amount: 390, date: new Date('2026-02-21'), notes: 'Weekly groceries', description: 'Food shopping' },
    { type: 'expense', category: 'Groceries', amount: 400, date: new Date('2026-03-07'), notes: 'Weekly groceries', description: 'Food shopping' },
    { type: 'expense', category: 'Utilities', amount: 120, date: new Date('2026-01-05'), notes: 'Electricity', description: 'Monthly electricity bill' },
    { type: 'expense', category: 'Utilities', amount: 95, date: new Date('2026-01-15'), notes: 'Internet', description: 'Monthly internet service' },
    { type: 'expense', category: 'Utilities', amount: 130, date: new Date('2026-02-05'), notes: 'Electricity', description: 'Monthly electricity bill' },
    { type: 'expense', category: 'Utilities', amount: 95, date: new Date('2026-02-15'), notes: 'Internet', description: 'Monthly internet service' },
    { type: 'expense', category: 'Transportation', amount: 80, date: new Date('2026-01-12'), notes: 'Gas', description: 'Car fuel' },
    { type: 'expense', category: 'Transportation', amount: 150, date: new Date('2026-01-28'), notes: 'Maintenance', description: 'Oil change' },
    { type: 'expense', category: 'Transportation', amount: 75, date: new Date('2026-02-12'), notes: 'Gas', description: 'Car fuel' },
    { type: 'expense', category: 'Entertainment', amount: 45, date: new Date('2026-01-18'), notes: 'Movies', description: 'Weekend movies' },
    { type: 'expense', category: 'Entertainment', amount: 120, date: new Date('2026-02-14'), notes: 'Valentine dinner', description: 'Restaurant dinner' },
    { type: 'expense', category: 'Entertainment', amount: 60, date: new Date('2026-03-10'), notes: 'Concert', description: 'Live concert ticket' },
    { type: 'expense', category: 'Healthcare', amount: 200, date: new Date('2026-01-22'), notes: 'Doctor visit', description: 'Annual checkup' },
    { type: 'expense', category: 'Healthcare', amount: 85, date: new Date('2026-02-28'), notes: 'Pharmacy', description: 'Prescription medication' },
    { type: 'expense', category: 'Shopping', amount: 250, date: new Date('2026-02-08'), notes: 'Clothing', description: 'Work clothes' },
    { type: 'expense', category: 'Shopping', amount: 180, date: new Date('2026-03-05'), notes: 'Electronics', description: 'Accessories' },
    { type: 'expense', category: 'Subscription', amount: 15, date: new Date('2026-01-01'), notes: 'Netflix', description: 'Monthly subscription' },
    { type: 'expense', category: 'Subscription', amount: 10, date: new Date('2026-01-01'), notes: 'Spotify', description: 'Monthly subscription' },
    { type: 'expense', category: 'Subscription', amount: 15, date: new Date('2026-02-01'), notes: 'Netflix', description: 'Monthly subscription' },
    { type: 'expense', category: 'Subscription', amount: 10, date: new Date('2026-02-01'), notes: 'Spotify', description: 'Monthly subscription' },
    { type: 'expense', category: 'Subscription', amount: 15, date: new Date('2026-03-01'), notes: 'Netflix', description: 'Monthly subscription' },
    { type: 'expense', category: 'Subscription', amount: 10, date: new Date('2026-03-01'), notes: 'Spotify', description: 'Monthly subscription' }
  ]
};

async function seedDatabase() {
  try {
    console.log('Starting database seed...\n');
    console.log('WARNING: This will DELETE ALL existing data!\n');
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB\n');
    console.log('Deleting all existing data...');
    await Promise.all([
      User.deleteMany({}),
      FinancialRecord.deleteMany({}),
      TokenBlacklist.deleteMany({})
    ]);
    console.log('All data deleted\n');
    console.log('Creating users...');
    const createdUsers = [];
    for (const userData of seedData.users) {
      const user = await User.create({ ...userData, createdBy: null });
      createdUsers.push(user);
      console.log(`   Created ${user.role.padEnd(8)} | ${user.email}`);
    }
    console.log('');
    console.log('Creating financial records...');
    for (const user of createdUsers) {
      const recordsToCreate = seedData.records.map(record => ({ ...record, user: user._id }));
      await FinancialRecord.insertMany(recordsToCreate);
      console.log(`   Created ${user.name.padEnd(25)} | ${seedData.records.length} records`);
    }
    console.log('');
    const userCount = await User.countDocuments();
    const recordCount = await FinancialRecord.countDocuments();
    console.log('SEED SUMMARY');
    console.log('='.repeat(60));
    console.log(`   Users Created:  ${userCount}`);
    console.log(`   Records Created: ${recordCount}`);
    console.log('='.repeat(60));
    console.log('\nTEST CREDENTIALS');
    console.log('='.repeat(60));
    console.log('   ADMIN CREDENTIALS:');
    console.log('      Email:    admin@financedashboard.com');
    console.log('      Password: Admin@123');
    console.log('');
    console.log('   ANALYST CREDENTIALS:');
    console.log('      Email:    analyst@financedashboard.com');
    console.log('      Password: Analyst@123');
    console.log('');
    console.log('   VIEWER CREDENTIALS:');
    console.log('      Email:    viewer@financedashboard.com');
    console.log('      Password: Viewer@123');
    console.log('='.repeat(60));
    console.log('\nDatabase seeded successfully!\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\nSeed failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedData };
