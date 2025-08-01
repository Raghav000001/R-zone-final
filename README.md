# Yoga Wellness Website

A comprehensive yoga and wellness management system with AI-powered personalized fitness plans.

## Features

- **Admin Dashboard**: Manage members, trainers, and view analytics
- **Trainer Dashboard**: Manage assigned members and their progress
- **AI Fitness Planner**: Generate personalized gym routines with Push-Pull-Leg splits, FST-7 training, and high-protein nutrition plans using GPT-3.5-turbo
- **Member Management**: Complete CRUD operations with photo capture
- **Authentication**: Secure login for admins and trainers

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenRouter API Key for AI Fitness Plan Generation
# Get your API key from: https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here

# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string_here

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret_here

# Cloudinary Configuration (optional - for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Get OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Sign up for an account
3. Generate an API key
4. Add the key to your `.env.local` file

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Routes

### AI Fitness Plan Generation

**POST** `/api/generate-plan`

Generates personalized fitness plans using GPT-3.5-turbo.

**Request Body:**
```json
{
  "name": "John Doe",
  "age": 30,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "fitnessGoal": "muscle-building",
  "lifestyle": "moderate",
  "medicalConditions": "none"
}
```

**Response:**
```json
{
  "plan": {
    "pushWorkout": [
      "Exercise 1: Barbell Bench Press - 4 sets x 8-10 reps, 2 min rest",
      "Exercise 2: Incline Dumbbell Press - 3 sets x 10-12 reps, 90 sec rest",
      "Exercise 3: Military Press - 3 sets x 8-10 reps, 2 min rest",
      "Exercise 4: Dips - 3 sets x 10-15 reps, 90 sec rest",
      "Exercise 5: Lateral Raises - 3 sets x 12-15 reps, 60 sec rest"
    ],
    "pullWorkout": [
      "Exercise 1: Deadlifts - 4 sets x 6-8 reps, 3 min rest",
      "Exercise 2: Pull-ups - 3 sets x 8-12 reps, 2 min rest",
      "Exercise 3: Barbell Rows - 3 sets x 10-12 reps, 90 sec rest",
      "Exercise 4: Lat Pulldowns - 3 sets x 12-15 reps, 60 sec rest",
      "Exercise 5: Bicep Curls - 3 sets x 12-15 reps, 60 sec rest"
    ],
    "legWorkout": [
      "Exercise 1: Squats - 4 sets x 8-10 reps, 3 min rest",
      "Exercise 2: Romanian Deadlifts - 3 sets x 10-12 reps, 2 min rest",
      "Exercise 3: Leg Press - 3 sets x 12-15 reps, 90 sec rest",
      "Exercise 4: Walking Lunges - 3 sets x 20 steps each leg, 60 sec rest",
      "Exercise 5: Calf Raises - 4 sets x 15-20 reps, 45 sec rest"
    ],
    "fst7Workout": [
      "Exercise 1: Cable Flyes - 7 sets x 7-10 reps, 30-45 sec rest",
      "Exercise 2: Tricep Pushdowns - 7 sets x 7-10 reps, 30-45 sec rest",
      "Exercise 3: Lateral Raises - 7 sets x 7-10 reps, 30-45 sec rest",
      "Exercise 4: Bicep Curls - 7 sets x 7-10 reps, 30-45 sec rest",
      "Exercise 5: Leg Extensions - 7 sets x 7-10 reps, 30-45 sec rest"
    ],
    "dietPlan": {
      "breakfast": "Protein shake (30g protein), 1 cup oats, 1 banana, 2 tbsp peanut butter - 45g protein, 65g carbs, 15g fat",
      "lunch": "8oz grilled chicken breast, 1 cup brown rice, 2 cups mixed vegetables - 50g protein, 45g carbs, 8g fat",
      "dinner": "8oz salmon, 1 cup quinoa, 1 cup broccoli - 45g protein, 40g carbs, 20g fat",
      "snacks": "Greek yogurt with berries, protein bar, handful of almonds - 25g protein, 20g carbs, 12g fat",
      "supplements": "Whey protein (30g post-workout), Creatine (5g daily), Multivitamin, Omega-3 (2g daily)"
    },
    "wellnessRecommendations": [
      "Progressive overload: Increase weight or reps each week",
      "Get 7-9 hours of quality sleep for muscle recovery",
      "Stay hydrated: Drink 1 gallon of water daily",
      "Track your workouts and nutrition consistently",
      "Include 1-2 rest days per week for optimal recovery"
    ]
  }
}
```

## Features

### AI Fitness Planner
- **Push-Pull-Leg Split**: Comprehensive workout routines targeting all muscle groups
- **FST-7 Training**: Fascia Stretch Training for muscle growth and definition
- **High-Protein Nutrition**: Detailed meal plans with macro breakdowns
- **Supplement Recommendations**: Evidence-based supplement guidance
- **PDF Download**: Professional fitness plan export
- **Real-time AI Generation**: Using GPT-3.5-turbo for personalized plans

### Admin Features
- Member management with photo capture
- Trainer management
- Analytics dashboard
- Real-time statistics

### Trainer Features
- View assigned members
- Add new members
- Edit member details
- Photo capture functionality

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **AI**: OpenRouter API with GPT-3.5-turbo
- **Authentication**: JWT with HTTP-only cookies
- **PDF Generation**: html2pdf.js
- **UI Components**: shadcn/ui

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License. #   R - z o n e - f i n a l  
 