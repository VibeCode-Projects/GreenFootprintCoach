const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Activity = require('../models/Activity');
const CarbonRecord = require('../models/CarbonRecord');
const Recommendation = require('../models/Recommendation');
const Achievement = require('../models/Achievement');
const UserChallenge = require('../models/UserChallenge');
const { getLocalDateString } = require('./dateUtils');

const initialChallenges = [
  {
    title: 'Zero Single-Use Plastic Week',
    description: 'Refuse single-use plastic bags, disposable water bottles, and plastic cutlery for 7 consecutive days.',
    category: 'shopping',
    type: 'weekly',
    targetDays: 7,
    targetMetric: '7 days plastic-free',
    pointsReward: 60,
    carbonSavingsEstimateKg: 2.5,
    icon: 'Package',
    difficulty: 'easy',
    participantsCount: 38
  },
  {
    title: 'Active Commuter: Walk & Cycle',
    description: 'Replace short car or cab journeys under 3 km with walking or bicycling.',
    category: 'transport',
    type: 'weekly',
    targetDays: 5,
    targetMetric: '5 short active trips',
    pointsReward: 85,
    carbonSavingsEstimateKg: 7.2,
    icon: 'Bike',
    difficulty: 'medium',
    participantsCount: 54
  },
  {
    title: 'AC Eco-Thermostat 24°C',
    description: 'Keep your air conditioner set to 24°C (75°F) or higher for 7 days to slash compressor power drain.',
    category: 'energy',
    type: 'weekly',
    targetDays: 7,
    targetMetric: '7 days at 24°C',
    pointsReward: 70,
    carbonSavingsEstimateKg: 6.0,
    icon: 'Wind',
    difficulty: 'easy',
    participantsCount: 42
  },
  {
    title: 'Meatless Lunch Week',
    description: 'Enjoy delicious, protein-rich plant-based or vegetarian lunches for 5 consecutive days.',
    category: 'food',
    type: 'weekly',
    targetDays: 5,
    targetMetric: '5 vegetarian lunches',
    pointsReward: 90,
    carbonSavingsEstimateKg: 8.5,
    icon: 'Salad',
    difficulty: 'medium',
    participantsCount: 29
  },
  {
    title: 'Public Transit Champion',
    description: 'Take the subway, train, or city bus for at least 4 trips instead of driving alone.',
    category: 'transport',
    type: 'weekly',
    targetDays: 4,
    targetMetric: '4 public transit rides',
    pointsReward: 75,
    carbonSavingsEstimateKg: 5.8,
    icon: 'Bus',
    difficulty: 'medium',
    participantsCount: 31
  },
  {
    title: '5-Minute Power Shower',
    description: 'Limit hot water showers to 5 minutes or less to conserve water heating electricity and municipal supply.',
    category: 'water',
    type: 'weekly',
    targetDays: 7,
    targetMetric: '7 rapid showers',
    pointsReward: 50,
    carbonSavingsEstimateKg: 3.5,
    icon: 'Droplets',
    difficulty: 'easy',
    participantsCount: 47
  }
];

async function seedInitialChallenges() {
  try {
    const count = await Challenge.countDocuments();
    if (count === 0) {
      await Challenge.insertMany(initialChallenges);
      console.log(`[Seed] Seeded ${initialChallenges.length} initial eco challenges successfully.`);
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed challenges:', error.message);
  }
}

async function seedDemoUser() {
  try {
    const demoEmail = 'test@ecocoach.com';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      user = await User.create({
        name: 'Demo Student',
        email: demoEmail,
        password: 'password123',
        ecoPoints: 185,
        level: 2,
        levelTitle: 'Sprout',
        streak: 4,
        bio: 'BCA Final Year Student exploring sustainable lifestyle choices.',
        location: 'Academic Demo Lab',
        targetDailyEmissionKg: 5.0
      });

      console.log(`[Seed] Created default demo user: ${demoEmail} / password123`);

      // Seed historical achievements for demo user
      await Achievement.insertMany([
        {
          userId: user._id,
          badgeKey: 'welcome_pioneer',
          title: 'Green Pioneer',
          description: 'Joined the AI Eco-Habit & Green Footprint community',
          icon: 'Sprout',
          category: 'milestone',
          points: 20
        },
        {
          userId: user._id,
          badgeKey: 'first_log',
          title: 'First Green Footprint',
          description: 'Logged your very first daily environmental activity',
          icon: 'Footprints',
          category: 'logging',
          points: 25
        },
        {
          userId: user._id,
          badgeKey: 'streak_3',
          title: 'Consistency Scout',
          description: 'Logged activities for 3 consecutive days',
          icon: 'Flame',
          category: 'streak',
          points: 50
        }
      ]);

      // Seed 4 days of realistic activity logs & daily CarbonRecords
      const now = new Date();
      const pastDaysData = [
        {
          daysAgo: 3,
          prompt: 'Travelled 12 km by metro, ate vegetarian lunch, worked on laptop for 5 hours.',
          totalCarbon: 1.45,
          transport: 0.35,
          energy: 0.25,
          food: 0.85,
          ecoScore: 92,
          items: [
            { category: 'transport', description: 'Metro / Train (12 km)', carbon_kg: 0.35, distance_km: 12, assumptions: 'Electric metro grid factor' },
            { category: 'food', description: 'Vegetarian meal (1 serving)', carbon_kg: 0.85, quantity: 1, assumptions: 'Plant/grain balanced meal' },
            { category: 'energy', description: 'Laptop usage for 5 hr(s)', carbon_kg: 0.25, duration_hours: 5, assumptions: '40W laptop energy' }
          ]
        },
        {
          daysAgo: 2,
          prompt: 'Drove 15 km in petrol car, used AC for 4 hours, ate chicken meal for dinner.',
          totalCarbon: 5.85,
          transport: 2.55,
          energy: 2.00,
          food: 1.30,
          ecoScore: 78,
          items: [
            { category: 'transport', description: 'Car (Petrol): 15 km', carbon_kg: 2.55, distance_km: 15, assumptions: '0.170 kg CO2e/km' },
            { category: 'energy', description: 'Air Conditioner running for 4 hr(s)', carbon_kg: 2.00, duration_hours: 4, assumptions: '1.5kW AC unit' },
            { category: 'food', description: 'Poultry / Chicken meal', carbon_kg: 1.30, quantity: 1, assumptions: 'IPCC poultry factor' }
          ]
        },
        {
          daysAgo: 1,
          prompt: 'Took public bus 10 km, ate vegan salad, warm shower for 10 minutes.',
          totalCarbon: 1.89,
          transport: 0.89,
          energy: 0.0,
          food: 0.55,
          water: 0.45,
          ecoScore: 94,
          items: [
            { category: 'transport', description: 'Public Bus (10 km)', carbon_kg: 0.89, distance_km: 10, assumptions: 'Local bus passenger-km' },
            { category: 'food', description: 'Vegan plant-based meal', carbon_kg: 0.55, quantity: 1, assumptions: 'Plant-based diet factor' },
            { category: 'water', description: 'Warm shower for 10 min', carbon_kg: 0.45, duration_hours: null, assumptions: 'Water heating power' }
          ]
        },
        {
          daysAgo: 0, // Today
          prompt: 'Today I travelled 15 km by car, used AC for 5 hours, ate chicken for lunch, and used public transport for 10 km.',
          totalCarbon: 7.06,
          transport: 3.26,
          energy: 2.50,
          food: 1.30,
          ecoScore: 68,
          items: [
            { category: 'transport', description: 'Car (Petrol): 15 km', carbon_kg: 2.55, distance_km: 15, assumptions: 'DEFRA petrol car factor' },
            { category: 'transport', description: 'Public Bus: 8 km', carbon_kg: 0.71, distance_km: 8, assumptions: 'DEFRA bus factor' },
            { category: 'energy', description: 'Air Conditioner running for 5 hr(s)', carbon_kg: 2.50, duration_hours: 5, assumptions: '1.5kW AC running at 0.50 kg/hr' },
            { category: 'food', description: 'Poultry / Chicken meal (1 serving)', carbon_kg: 1.30, quantity: 1, assumptions: 'IPCC chicken factor' }
          ]
        }
      ];

      for (const entry of pastDaysData) {
        const d = new Date(now);
        d.setDate(d.getDate() - entry.daysAgo);
        const dateString = getLocalDateString(d);

        await Activity.create({
          userId: user._id,
          rawText: entry.prompt,
          date: d,
          activities: entry.items,
          total_carbon_kg: entry.totalCarbon,
          eco_score: entry.ecoScore,
          aiSummary: `Calculated environmental footprint totaling ${entry.totalCarbon} kg CO2e across ${entry.items.length} daily activities.`,
          source: 'ai_logger'
        });

        await CarbonRecord.create({
          userId: user._id,
          dateString,
          date: d,
          total_carbon_kg: entry.totalCarbon,
          transport_kg: entry.transport || 0,
          energy_kg: entry.energy || 0,
          food_kg: entry.food || 0,
          shopping_kg: entry.shopping || 0,
          water_kg: entry.water || 0,
          waste_kg: entry.waste || 0,
          activitiesCount: entry.items.length
        });
      }

      // Seed an active joined challenge for the demo user
      const plasticChallenge = await Challenge.findOne({ category: 'shopping' });
      if (plasticChallenge) {
        await UserChallenge.create({
          userId: user._id,
          challengeId: plasticChallenge._id,
          status: 'in_progress',
          progressDays: 3,
          targetDays: 7
        });
      }

      console.log(`[Seed] Seeded historical activity telemetry for demo user successfully.`);
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed demo user:', error.message);
  }
}

async function seedDatabase() {
  await seedInitialChallenges();
  await seedDemoUser();
}

module.exports = { seedInitialChallenges, seedDemoUser, seedDatabase };
