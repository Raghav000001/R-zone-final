const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yoga-wellness');

// Define schemas inline for seeding
const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'trainer'], default: 'super_admin' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const TrainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  photo: { type: String },
  specialization: { type: String },
  experience: { type: Number },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  membershipType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  photoFront: { type: String },
  photoBack: { type: String },
  galleryPhotos: [String],
  amountPaid: { type: Number, default: 0 },
}, { timestamps: true });

// Create models
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const Trainer = mongoose.models.Trainer || mongoose.model('Trainer', TrainerSchema);
const Member = mongoose.models.Member || mongoose.model('Member', MemberSchema);

async function seed() {
  try {
    // Clear existing data
    await Admin.deleteMany({});
    await Member.deleteMany({});
    await Trainer.deleteMany({});

    console.log('Cleared existing data');

    // Create admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new Admin({
      name: 'Super Admin',
      email: 'admin@serenityyoga.com',
      password: adminPassword,
      role: 'super_admin',
      isActive: true
    });
    await admin.save();
    console.log('Created admin: admin@serenityyoga.com / admin123');

    // Create test trainer
    const trainerPassword = await bcrypt.hash('trainer123', 10);
    const trainer = new Trainer({
      name: 'Test Trainer',
      email: 'trainer@test.com',
      password: trainerPassword,
      phone: '1234567890',
      specialization: 'Yoga',
      experience: 3,
      isActive: true
    });
    await trainer.save();
    console.log('Created trainer: trainer@test.com / trainer123');

    // Create some sample members
    const members = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        membershipType: 'Monthly',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-01'),
        amountPaid: 1500
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '9876543211',
        membershipType: 'Yearly',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        amountPaid: 15000
      }
    ];

    for (const memberData of members) {
      const member = new Member(memberData);
      await member.save();
    }
    console.log('Created sample members');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
