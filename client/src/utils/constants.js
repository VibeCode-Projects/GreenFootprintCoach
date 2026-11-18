export const API_BASE_URL = '/api';

export const CATEGORIES = {
  transport: {
    label: 'Transportation',
    icon: 'Car',
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  energy: {
    label: 'Energy & AC',
    icon: 'Zap',
    color: '#F59E0B',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200'
  },
  food: {
    label: 'Food & Diet',
    icon: 'Utensils',
    color: '#10B981',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200'
  },
  shopping: {
    label: 'Shopping & Goods',
    icon: 'ShoppingBag',
    color: '#8B5CF6',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  water: {
    label: 'Water Usage',
    icon: 'Droplets',
    color: '#06B6D4',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200'
  },
  waste: {
    label: 'Waste Management',
    icon: 'Trash2',
    color: '#64748B',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200'
  },
  other: {
    label: 'Other Impact',
    icon: 'Leaf',
    color: '#166534',
    bgColor: 'bg-forest-50',
    textColor: 'text-forest-800',
    borderColor: 'border-forest-200'
  }
};

export const USER_LEVELS = [
  { level: 1, title: 'Seedling', minPoints: 0, maxPoints: 99, badge: '🌱' },
  { level: 2, title: 'Sprout', minPoints: 100, maxPoints: 299, badge: '🌿' },
  { level: 3, title: 'Eco Scout', minPoints: 300, maxPoints: 599, badge: '🌲' },
  { level: 4, title: 'Green Guardian', minPoints: 600, maxPoints: 999, badge: '🛡️' },
  { level: 5, title: 'Earth Champion', minPoints: 1000, maxPoints: Infinity, badge: '🌍' }
];

export const DEMO_PROMPTS = [
  "Today I travelled 15 km by car, used AC for 5 hours, ate chicken for lunch, and used public transport for 10 km.",
  "Drove 22 km to college in a petrol car, worked on my laptop for 6 hours, had a vegetarian thali meal, and took a 10 min hot shower.",
  "Took the metro for 18 km, had a vegan salad lunch, purchased 2 plastic bottles of water, and kept AC running for 3 hours.",
  "Walked 3 km to the grocery store, ate beef burger for dinner, and did 1 load of laundry with warm water."
];
