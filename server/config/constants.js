/**
 * Scientific and Documented Emission Factors
 * Sources: DEFRA (UK Government GHG Conversion Factors), EPA GHG Equivalencies, IPCC
 * Units: kg CO2 equivalent per specified unit
 */
const EMISSION_FACTORS = {
  // Transport (per passenger-km)
  transport: {
    car_petrol: 0.170,        // Average petrol car kg CO2e / km
    car_diesel: 0.165,        // Average diesel car kg CO2e / km
    car_electric: 0.047,      // Grid charging average kg CO2e / km
    car_hybrid: 0.105,        // Hybrid car kg CO2e / km
    car_default: 0.170,       // Generic car passenger km
    bus_local: 0.089,         // Local bus per passenger km
    bus_coach: 0.027,         // Long distance coach
    train_local: 0.035,       // Passenger rail local
    train_metro: 0.029,       // Subway / light rail
    flight_domestic: 0.246,   // Domestic flight (<500km) per passenger km
    flight_longhaul: 0.147,   // Long haul flight per passenger km
    motorcycle: 0.113,        // Motorcycle average per km
    bicycle: 0.0,             // Zero direct tailpipe emissions
    walk: 0.0,                // Zero direct emissions
    carpool_2person: 0.085    // Shared car (half average)
  },

  // Electricity and Home Energy
  energy: {
    grid_electricity_kwh: 0.475,  // Average grid carbon intensity (global median ~475g CO2e/kWh)
    air_conditioner_per_hour: 0.50, // Typical 1.5kW AC running 1 hour (~1.05 kWh * 0.475 kg)
    heater_electric_per_hour: 0.95, // 2kW electric space heater per hour
    refrigerator_per_day: 0.60,     // Typical household fridge (1.2 kWh/day)
    desktop_computer_per_hour: 0.07,// ~150W computer
    laptop_per_hour: 0.02,          // ~40W laptop
    tv_per_hour: 0.05,              // 50-inch LED TV (~100W)
    washing_machine_per_cycle: 0.35,// Warm wash cycle (~0.7 kWh)
    water_heater_electric_per_hour: 1.50 // 3kW geyser / water heater
  },

  // Food and Diet (per serving / kg)
  food: {
    beef_serving: 6.61,         // ~250g serving of beef (~27kg CO2e/kg beef)
    lamb_serving: 5.50,         // ~250g serving of lamb
    pork_serving: 1.80,         // ~250g serving of pork
    poultry_chicken_serving: 1.30, // ~250g serving of chicken (~5.2kg CO2e/kg)
    fish_serving: 1.10,         // ~200g serving of farmed/wild fish
    dairy_milk_liter: 1.39,     // 1 liter cow milk
    cheese_serving: 1.05,       // 100g cheese (~10.5kg CO2e/kg)
    eggs_serving: 0.53,         // 2 eggs (~4.4kg CO2e/kg)
    vegetarian_meal: 0.85,      // Grain/legume/vegetable balanced meal
    vegan_meal: 0.55,           // Plant-based meal
    fast_food_burger_meal: 3.20,// Burger + fries + drink
    coffee_cup: 0.21,           // Latte / milk coffee (~0.21kg)
    black_coffee_cup: 0.05      // Espresso / black coffee
  },

  // Shopping & Goods
  shopping: {
    clothing_cotton_tshirt: 4.5, // 1 cotton t-shirt life cycle
    clothing_jeans: 20.0,        // 1 pair of denim jeans
    shoes_leather_or_sneakers: 14.0, // 1 pair sneakers/shoes
    smartphone_lifecycle_amortized: 0.20, // Daily share of phone or 70kg total
    plastic_bottle: 0.082,       // 500ml single-use PET bottle
    paper_bag: 0.055,            // 1 paper bag
    cardboard_delivery_box: 0.30 // E-commerce packaging delivery box
  },

  // Water Usage
  water: {
    water_tap_per_liter: 0.0003, // Municipal tap supply & wastewater treatment
    shower_10_min: 0.45,         // Warm shower (approx 60-80 liters heated)
    bath_tub: 0.90,              // Full warm bath tub (~150 liters heated)
    car_wash_hose: 0.80          // Washing car with hose (~200 liters)
  },

  // Waste Management
  waste: {
    landfill_waste_per_kg: 0.58,  // Organic & mixed waste sending methane in landfill
    recycled_waste_per_kg: 0.08,  // Processing recycled waste
    composted_waste_per_kg: 0.05  // Properly aerated compost
  }
};

const USER_LEVELS = [
  { level: 1, title: 'Seedling', minPoints: 0, maxPoints: 99, color: 'text-emerald-600', badge: '🌱' },
  { level: 2, title: 'Sprout', minPoints: 100, maxPoints: 299, color: 'text-emerald-700', badge: '🌿' },
  { level: 3, title: 'Eco Scout', minPoints: 300, maxPoints: 599, color: 'text-teal-600', badge: '🌲' },
  { level: 4, title: 'Green Guardian', minPoints: 600, maxPoints: 999, color: 'text-green-700', badge: '🛡️' },
  { level: 5, title: 'Earth Champion', minPoints: 1000, maxPoints: Infinity, color: 'text-amber-600', badge: '🌍' }
];

module.exports = {
  EMISSION_FACTORS,
  USER_LEVELS
};
