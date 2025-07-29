const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Use the same Admin schema as in your project
const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'trainer'], required: true },
  phone: { type: String },
  specialization: [{ type: String }],
  experience: { type: String },
  rating: { type: Number, default: 0 },
  students: { type: Number, default: 0 },
  bio: { type: String },
  certifications: [{ type: String }],
  languages: [{ type: String }],
  availability: { type: String },
  photo: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seedSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yoga-wellness');
    const email = 'nitin_admin@rzonefitness.com';
    const password = 'nitin@01';
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log('Super admin already exists:', email);
      process.exit(0);
    }
    const superAdmin = new Admin({
      name: 'Nitin Super Admin',
      email,
      password,
      role: 'super_admin',
      isActive: true
    });
    await superAdmin.save();
    console.log('Super admin created:', email, '/ nitin@01');
    process.exit(0);
  } catch (error) {
    console.error('Failed to create super admin:', error);
    process.exit(1);
  }
}

seedSuperAdmin();
