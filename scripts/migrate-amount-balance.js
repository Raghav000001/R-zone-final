const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/r-zone');

// Define the Member schema (same as in models/Member.ts)
const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  membershipType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  photo: { type: String },
  photoFront: { type: String },
  photoBack: { type: String },
  galleryPhotos: [{ type: String }],
  amountPaid: { type: Number, default: 0 },
  amountBalance: { type: Number, default: 0 },
}, { timestamps: true });

const Member = mongoose.model('Member', MemberSchema);

async function migrateAmountBalance() {
  try {
    console.log('Starting migration...');
    
    // Find all members that don't have amountBalance field
    const members = await Member.find({ amountBalance: { $exists: false } });
    console.log(`Found ${members.length} members without amountBalance field`);
    
    // Update all members to add amountBalance field with default value 0
    const result = await Member.updateMany(
      { amountBalance: { $exists: false } },
      { $set: { amountBalance: 0 } }
    );
    
    console.log(`Updated ${result.modifiedCount} members`);
    
    // Verify the update
    const updatedMembers = await Member.find({});
    console.log(`Total members: ${updatedMembers.length}`);
    console.log('Sample member:', {
      name: updatedMembers[0]?.name,
      amountPaid: updatedMembers[0]?.amountPaid,
      amountBalance: updatedMembers[0]?.amountBalance
    });
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrateAmountBalance(); 