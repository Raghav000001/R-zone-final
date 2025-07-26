require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Trainer Schema (simplified for seeding)
const TrainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  photo: String,
  contact: String,
  specialization: String,
  experience: Number,
  bio: String,
  rating: Number,
  students: Number,
  certifications: [String],
  languages: [String],
  availability: String,
  specialties: [String],
  achievements: [String],
  testimonials: [{
    name: String,
    text: String,
    rating: Number
  }],
  classTypes: [{
    name: String,
    duration: String,
    price: String,
    description: String
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Trainer = mongoose.models.Trainer || mongoose.model('Trainer', TrainerSchema);

async function seedTrainers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing trainers
    await Trainer.deleteMany({});
    console.log('Cleared existing trainers');

    // Sample trainers data
    const sampleTrainers = [
      {
        name: "Rajesh Kumar",
        email: "rajesh@rzonefitness.com",
        password: "password123",
        phone: "9876543210",
        photo: "/placeholder-user.jpg",
        contact: "9876543210",
        specialization: "Weight Training & Bodybuilding",
        experience: 8,
        bio: "Certified personal trainer with 8 years of experience in weight training and bodybuilding. Specializes in muscle building and strength training programs.",
        rating: 4.8,
        students: 150,
        certifications: ["ACE Personal Trainer", "NASM Certified", "Bodybuilding Specialist"],
        languages: ["English", "Hindi", "Punjabi"],
        availability: "Mon-Sat: 6AM-10PM",
        specialties: ["Muscle Building", "Strength Training", "Bodybuilding", "Powerlifting"],
        achievements: [
          "Trained 150+ clients successfully",
          "Former state-level bodybuilding champion",
          "Certified by ACE and NASM",
          "Featured in fitness magazines"
        ],
        testimonials: [
          {
            name: "Amit Singh",
            text: "Rajesh helped me gain 15kg of muscle in just 6 months. His knowledge is incredible!",
            rating: 5
          },
          {
            name: "Priya Sharma",
            text: "Best trainer I've ever worked with. Very patient and knowledgeable.",
            rating: 5
          }
        ],
        classTypes: [
          {
            name: "Personal Training",
            duration: "60 minutes",
            price: "₹2000",
            description: "One-on-one personalized training session"
          },
          {
            name: "Group Training",
            duration: "45 minutes",
            price: "₹800",
            description: "Small group training session"
          }
        ]
      },
      {
        name: "Priya Patel",
        email: "priya@rzonefitness.com",
        password: "password123",
        phone: "9876543211",
        photo: "/placeholder-user.jpg",
        contact: "9876543211",
        specialization: "Yoga & Wellness",
        experience: 6,
        bio: "Certified yoga instructor with expertise in Hatha, Ashtanga, and therapeutic yoga. Helps clients achieve mental and physical wellness.",
        rating: 4.9,
        students: 120,
        certifications: ["RYT-500", "Yoga Alliance Certified", "Therapeutic Yoga Specialist"],
        languages: ["English", "Hindi", "Gujarati"],
        availability: "Mon-Sun: 6AM-8PM",
        specialties: ["Hatha Yoga", "Ashtanga Yoga", "Therapeutic Yoga", "Meditation"],
        achievements: [
          "RYT-500 certified instructor",
          "Trained 120+ yoga students",
          "Specialized in therapeutic yoga",
          "Conducted workshops in 5+ cities"
        ],
        testimonials: [
          {
            name: "Sarah Johnson",
            text: "Priya's yoga classes are transformative. I feel so much better mentally and physically.",
            rating: 5
          },
          {
            name: "Ravi Kumar",
            text: "Her therapeutic yoga helped me recover from back pain. Highly recommended!",
            rating: 5
          }
        ],
        classTypes: [
          {
            name: "Hatha Yoga",
            duration: "60 minutes",
            price: "₹600",
            description: "Traditional Hatha yoga for beginners and intermediates"
          },
          {
            name: "Therapeutic Yoga",
            duration: "75 minutes",
            price: "₹800",
            description: "Specialized yoga for pain relief and healing"
          }
        ]
      },
      {
        name: "Amit Sharma",
        email: "amit@rzonefitness.com",
        password: "password123",
        phone: "9876543212",
        photo: "/placeholder-user.jpg",
        contact: "9876543212",
        specialization: "Cardio & HIIT Training",
        experience: 5,
        bio: "Specialized in cardiovascular fitness and high-intensity interval training. Helps clients improve endurance and burn fat effectively.",
        rating: 4.7,
        students: 80,
        certifications: ["ACE Personal Trainer", "HIIT Specialist", "Cardio Fitness Expert"],
        languages: ["English", "Hindi"],
        availability: "Mon-Sat: 5AM-9PM",
        specialties: ["HIIT Training", "Cardio Fitness", "Fat Loss", "Endurance Training"],
        achievements: [
          "ACE certified personal trainer",
          "HIIT training specialist",
          "Helped 80+ clients achieve fat loss goals",
          "Former marathon runner"
        ],
        testimonials: [
          {
            name: "Neha Gupta",
            text: "Amit's HIIT sessions are intense but effective. I lost 10kg in 3 months!",
            rating: 5
          },
          {
            name: "Karan Singh",
            text: "Great cardio trainer. His endurance programs are excellent.",
            rating: 4
          }
        ],
        classTypes: [
          {
            name: "HIIT Training",
            duration: "30 minutes",
            price: "₹500",
            description: "High-intensity interval training for fat burning"
          },
          {
            name: "Cardio Session",
            duration: "45 minutes",
            price: "₹400",
            description: "Cardiovascular fitness training"
          }
        ]
      }
    ];

    // Hash passwords and insert trainers
    for (const trainerData of sampleTrainers) {
      const salt = await bcrypt.genSalt(10);
      trainerData.password = await bcrypt.hash(trainerData.password, salt);
    }

    const trainers = await Trainer.insertMany(sampleTrainers);
    console.log(`Seeded ${trainers.length} trainers successfully`);

    console.log('Sample trainers created:');
    trainers.forEach(trainer => {
      console.log(`- ${trainer.name} (${trainer.specialization})`);
    });

  } catch (error) {
    console.error('Error seeding trainers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedTrainers(); 