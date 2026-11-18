const { EMISSION_FACTORS } = require('../config/constants');

/**
 * Standard Carbon Footprint Calculation Service
 * Implements documented emission factors (DEFRA, EPA, IPCC)
 */
class CarbonCalculationService {
  /**
   * Calculate emissions for Transportation
   * @param {Object} data { mode, distance_km, passengers, fuelType }
   */
  calculateTransport(data) {
    const distance = Math.max(0, parseFloat(data.distance_km) || 0);
    const mode = (data.mode || 'car').toLowerCase();
    const fuel = (data.fuelType || 'petrol').toLowerCase();
    const passengers = Math.max(1, parseInt(data.passengers) || 1);

    let factor = EMISSION_FACTORS.transport.car_petrol;
    let label = 'Car (Petrol)';

    if (mode.includes('electric') || fuel === 'electric') {
      factor = EMISSION_FACTORS.transport.car_electric;
      label = 'Car (Electric)';
    } else if (mode.includes('hybrid') || fuel === 'hybrid') {
      factor = EMISSION_FACTORS.transport.car_hybrid;
      label = 'Car (Hybrid)';
    } else if (fuel === 'diesel') {
      factor = EMISSION_FACTORS.transport.car_diesel;
      label = 'Car (Diesel)';
    } else if (mode.includes('bus')) {
      factor = EMISSION_FACTORS.transport.bus_local;
      label = 'Public Bus';
    } else if (mode.includes('train') || mode.includes('metro') || mode.includes('subway')) {
      factor = EMISSION_FACTORS.transport.train_metro;
      label = 'Metro / Train';
    } else if (mode.includes('bike') || mode.includes('bicycle')) {
      factor = 0;
      label = 'Bicycle';
    } else if (mode.includes('walk')) {
      factor = 0;
      label = 'Walking';
    } else if (mode.includes('flight') || mode.includes('plane')) {
      factor = distance < 500 ? EMISSION_FACTORS.transport.flight_domestic : EMISSION_FACTORS.transport.flight_longhaul;
      label = 'Air Travel';
    } else if (mode.includes('motorcycle') || mode.includes('bike_motor')) {
      factor = EMISSION_FACTORS.transport.motorcycle;
      label = 'Motorcycle';
    }

    const totalKg = Number(((distance * factor) / passengers).toFixed(2));
    return {
      category: 'transport',
      description: `${label}: ${distance} km`,
      distance_km: distance,
      carbon_kg: totalKg,
      factor_used: factor,
      assumptions: `${label} emission factor: ${factor} kg CO2e/km (shared among ${passengers} passenger(s))`
    };
  }

  /**
   * Calculate emissions for Electricity & Energy
   * @param {Object} data { appliance, hours, kwh }
   */
  calculateEnergy(data) {
    let carbonKg = 0;
    let description = '';
    let assumptions = '';

    if (data.kwh) {
      const kwh = Math.max(0, parseFloat(data.kwh) || 0);
      carbonKg = kwh * EMISSION_FACTORS.energy.grid_electricity_kwh;
      description = `Direct electricity usage: ${kwh} kWh`;
      assumptions = `Grid intensity: ${EMISSION_FACTORS.energy.grid_electricity_kwh} kg CO2e/kWh`;
    } else {
      const hours = Math.max(0, parseFloat(data.hours) || 1);
      const appliance = (data.appliance || 'ac').toLowerCase();

      if (appliance.includes('ac') || appliance.includes('air conditioner')) {
        carbonKg = hours * EMISSION_FACTORS.energy.air_conditioner_per_hour;
        description = `Air Conditioner running for ${hours} hr(s)`;
        assumptions = `~1.5kW AC running at 0.50 kg CO2e/hr`;
      } else if (appliance.includes('heater')) {
        carbonKg = hours * EMISSION_FACTORS.energy.heater_electric_per_hour;
        description = `Electric heater running for ${hours} hr(s)`;
        assumptions = `2kW heater at 0.95 kg CO2e/hr`;
      } else if (appliance.includes('computer') || appliance.includes('pc')) {
        carbonKg = hours * EMISSION_FACTORS.energy.desktop_computer_per_hour;
        description = `Computer usage for ${hours} hr(s)`;
        assumptions = `Desktop ~150W at 0.07 kg CO2e/hr`;
      } else if (appliance.includes('laptop')) {
        carbonKg = hours * EMISSION_FACTORS.energy.laptop_per_hour;
        description = `Laptop usage for ${hours} hr(s)`;
        assumptions = `Laptop ~40W at 0.02 kg CO2e/hr`;
      } else if (appliance.includes('tv')) {
        carbonKg = hours * EMISSION_FACTORS.energy.tv_per_hour;
        description = `TV viewing for ${hours} hr(s)`;
        assumptions = `LED TV ~100W at 0.05 kg CO2e/hr`;
      } else if (appliance.includes('water heater') || appliance.includes('geyser')) {
        carbonKg = hours * EMISSION_FACTORS.energy.water_heater_electric_per_hour;
        description = `Water heater running for ${hours} hr(s)`;
        assumptions = `3kW water heater at 1.50 kg CO2e/hr`;
      } else {
        carbonKg = hours * 0.25; // default modest appliance
        description = `${data.appliance || 'Household appliance'} for ${hours} hr(s)`;
        assumptions = `Average household appliance baseline: 0.25 kg CO2e/hr`;
      }
    }

    return {
      category: 'energy',
      description,
      duration_hours: parseFloat(data.hours) || null,
      carbon_kg: Number(carbonKg.toFixed(2)),
      assumptions
    };
  }

  /**
   * Calculate emissions for Food & Diet
   * @param {Object} data { mealType, servings }
   */
  calculateFood(data) {
    const meal = (data.mealType || 'vegetarian').toLowerCase();
    const servings = Math.max(1, parseInt(data.servings) || 1);

    let factor = EMISSION_FACTORS.food.vegetarian_meal;
    let label = 'Vegetarian meal';

    if (meal.includes('beef')) {
      factor = EMISSION_FACTORS.food.beef_serving;
      label = 'Beef meal';
    } else if (meal.includes('lamb') || meal.includes('mutton')) {
      factor = EMISSION_FACTORS.food.lamb_serving;
      label = 'Lamb / Mutton meal';
    } else if (meal.includes('chicken') || meal.includes('poultry')) {
      factor = EMISSION_FACTORS.food.poultry_chicken_serving;
      label = 'Poultry / Chicken meal';
    } else if (meal.includes('pork')) {
      factor = EMISSION_FACTORS.food.pork_serving;
      label = 'Pork meal';
    } else if (meal.includes('fish') || meal.includes('seafood')) {
      factor = EMISSION_FACTORS.food.fish_serving;
      label = 'Fish / Seafood meal';
    } else if (meal.includes('vegan') || meal.includes('plant')) {
      factor = EMISSION_FACTORS.food.vegan_meal;
      label = 'Vegan plant-based meal';
    } else if (meal.includes('fast food') || meal.includes('burger')) {
      factor = EMISSION_FACTORS.food.fast_food_burger_meal;
      label = 'Fast food meal';
    }

    const totalKg = Number((servings * factor).toFixed(2));
    return {
      category: 'food',
      description: `${label} (${servings} serving${servings > 1 ? 's' : ''})`,
      quantity: servings,
      unit: 'serving',
      carbon_kg: totalKg,
      assumptions: `${label} factor: ${factor} kg CO2e/serving (IPCC/Poore & Nemecek data)`
    };
  }

  /**
   * Calculate emissions for Shopping & Goods
   * @param {Object} data { itemType, quantity }
   */
  calculateShopping(data) {
    const item = (data.itemType || 'clothing').toLowerCase();
    const quantity = Math.max(1, parseInt(data.quantity) || 1);

    let factor = 5.0;
    let label = 'Purchased goods';

    if (item.includes('tshirt') || item.includes('shirt')) {
      factor = EMISSION_FACTORS.shopping.clothing_cotton_tshirt;
      label = 'Cotton t-shirt / clothing item';
    } else if (item.includes('jean') || item.includes('denim')) {
      factor = EMISSION_FACTORS.shopping.clothing_jeans;
      label = 'Pair of jeans';
    } else if (item.includes('shoes') || item.includes('sneaker')) {
      factor = EMISSION_FACTORS.shopping.shoes_leather_or_sneakers;
      label = 'Footwear / Shoes';
    } else if (item.includes('bottle') || item.includes('plastic')) {
      factor = EMISSION_FACTORS.shopping.plastic_bottle;
      label = 'Single-use plastic bottle';
    } else if (item.includes('delivery') || item.includes('package')) {
      factor = EMISSION_FACTORS.shopping.cardboard_delivery_box;
      label = 'E-commerce delivery box';
    }

    const totalKg = Number((quantity * factor).toFixed(2));
    return {
      category: 'shopping',
      description: `${quantity}x ${label}`,
      quantity,
      carbon_kg: totalKg,
      assumptions: `${label} lifecycle factor: ${factor} kg CO2e/item`
    };
  }

  /**
   * Calculate emissions for Water
   * @param {Object} data { type, minutes, liters }
   */
  calculateWater(data) {
    let carbonKg = 0;
    let description = '';
    const type = (data.type || 'shower').toLowerCase();

    if (type.includes('shower')) {
      const minutes = Math.max(1, parseFloat(data.minutes) || 10);
      carbonKg = (minutes / 10) * EMISSION_FACTORS.water.shower_10_min;
      description = `Warm shower for ${minutes} min`;
    } else if (type.includes('bath')) {
      carbonKg = EMISSION_FACTORS.water.bath_tub;
      description = `Warm bath tub`;
    } else {
      const liters = Math.max(1, parseFloat(data.liters) || 50);
      carbonKg = liters * EMISSION_FACTORS.water.water_tap_per_liter;
      description = `Tap water usage: ${liters} L`;
    }

    return {
      category: 'water',
      description,
      carbon_kg: Number(carbonKg.toFixed(2)),
      assumptions: `Water heating & distribution carbon factor`
    };
  }

  /**
   * Calculate emissions for Waste
   * @param {Object} data { wasteType, kg }
   */
  calculateWaste(data) {
    const weightKg = Math.max(0.1, parseFloat(data.kg) || 1.0);
    const type = (data.wasteType || 'landfill').toLowerCase();

    let factor = EMISSION_FACTORS.waste.landfill_waste_per_kg;
    let label = 'Landfill municipal waste';

    if (type.includes('recycled') || type.includes('recycle')) {
      factor = EMISSION_FACTORS.waste.recycled_waste_per_kg;
      label = 'Recycled waste';
    } else if (type.includes('compost')) {
      factor = EMISSION_FACTORS.waste.composted_waste_per_kg;
      label = 'Composted organic waste';
    }

    const totalKg = Number((weightKg * factor).toFixed(2));
    return {
      category: 'waste',
      description: `${weightKg} kg ${label}`,
      quantity: weightKg,
      unit: 'kg',
      carbon_kg: totalKg,
      assumptions: `${label} decomposition factor: ${factor} kg CO2e/kg`
    };
  }

  /**
   * Compute normalized Eco Score (0 - 100)
   * A daily footprint below 5 kg gives an excellent score (>80)
   * 5 - 12 kg gives moderate (50 - 80)
   * Above 15 kg decreases towards 15
   */
  computeEcoScore(totalKg) {
    if (totalKg <= 0.1) return 98;
    if (totalKg <= 3.0) return 92;
    if (totalKg <= 6.0) return 82;
    if (totalKg <= 10.0) return 68;
    if (totalKg <= 15.0) return 52;
    if (totalKg <= 25.0) return 35;
    return Math.max(12, Math.round(100 - (totalKg * 2.5)));
  }
}

module.exports = new CarbonCalculationService();
