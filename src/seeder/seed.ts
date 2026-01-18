import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { Admin } from '../models/Admin';
import mongoose from 'mongoose';

dotenv.config();

/**
 * Seeder to create initial admin user
 * Usage: ts-node src/seeder/seedAdmin.ts
 */
async function seedAdmin() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected\n');

    // Default admin credentials (change these in production!)
    const defaultAdmin = {
      firstName: 'Admin',
      lastName: 'User',
      email: process.env.ADMIN_EMAIL || 'admin@metricmintdigital.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'superadmin' as const,
      isActive: true,
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: defaultAdmin.email });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', defaultAdmin.email);
      console.log('   Skipping admin creation...\n');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    console.log('📝 Creating admin user...');
    console.log(`   Email: ${defaultAdmin.email}`);
    console.log(`   Role: ${defaultAdmin.role}`);
    console.log(`   Password: ${defaultAdmin.password}`);
    console.log('   ⚠️  Please change the password after first login!\n');

    const admin = new Admin(defaultAdmin);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log(`   Admin ID: ${admin._id}`);
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}\n`);

    console.log('✨ Seeding completed!\n');

  } catch (error: any) {
    console.error('❌ Error seeding admin:', error.message);
    if (error.code === 11000) {
      console.error('   Email already exists in database');
    }
    process.exit(1);
  } finally {
    // Close database connection
    try {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    } catch (error) {
      // Ignore close errors
    }
  }
}

// Run seeder
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log('✅ Seeder finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeder failed:', error);
      process.exit(1);
    });
}

export { seedAdmin };
