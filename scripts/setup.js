const fs = require("fs")
const path = require("path")

console.log("🚀 Setting up R-zone Fitness & Fitness...\n")

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local")
if (!fs.existsSync(envPath)) {
  console.log("📝 Creating .env.local file...")

  const envContent = `# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ultima-fitness
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ultima-fitness

# JWT Secret
JWT_SECRET=ultima-fitness-super-secret-jwt-key-2024-make-it-long-and-random-${Date.now()}

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=rzone-nextauth-secret-${Date.now()}

# File Upload (Optional - for image uploads)
# CLOUDINARY_CLOUD_NAME=your-cloudinary-name
# CLOUDINARY_API_KEY=your-cloudinary-key
# CLOUDINARY_API_SECRET=your-cloudinary-secret
`

  fs.writeFileSync(envPath, envContent)
  console.log("✅ .env.local created successfully!")
} else {
  console.log("✅ .env.local already exists")
}

console.log("\n📋 Next steps:")
console.log("1. Install dependencies: npm install")
console.log("2. Make sure MongoDB is running")
console.log("3. Seed the database: npm run seed")
console.log("4. Start the development server: npm run dev")
console.log("\n🎯 Then visit:")
console.log("- Main site: http://localhost:3000")
console.log("- Admin login: http://localhost:3000/admin/login")
console.log("- Trainer login: http://localhost:3000/trainer/login")
