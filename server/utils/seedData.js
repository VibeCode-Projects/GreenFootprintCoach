const Challenge = require('../models/Challenge');

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

module.exports = { seedInitialChallenges };
