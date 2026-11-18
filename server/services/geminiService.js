const { EMISSION_FACTORS } = require('../config/constants');
const carbonService = require('./carbonCalculationService');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  get isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  }

  /**
   * System Prompt instructing Gemini on Carbon Accounting rules
   */
  getSystemInstruction() {
    return `You are an expert Environmental Carbon Footprint Analyst & Sustainability Coach.
Your task is to analyze natural-language descriptions of human daily activities, extract each discrete activity, categorize it, and compute its carbon footprint in kg CO2 equivalent based on documented scientific emission factors (DEFRA, EPA, IPCC).

Rules:
1. Categories allowed: "transport", "energy", "food", "shopping", "water", "waste", "other".
2. Documented Factors:
   - Petrol Car: 0.170 kg CO2e / km
   - Diesel Car: 0.165 kg CO2e / km
   - Electric Car: 0.047 kg CO2e / km
   - Bus: 0.089 kg CO2e / km
   - Metro / Train: 0.035 kg CO2e / km
   - Domestic Flight: 0.246 kg CO2e / km
   - Walking / Cycling: 0.0 kg CO2e
   - Air Conditioning: ~0.50 kg CO2e / hour
   - Grid Electricity: 0.475 kg CO2e / kWh
   - Beef meal: 6.61 kg CO2e / serving (~250g)
   - Poultry/Chicken meal: 1.30 kg CO2e / serving
   - Vegetarian meal: 0.85 kg CO2e / serving
   - Vegan meal: 0.55 kg CO2e / serving
   - Warm shower: 0.45 kg CO2e per 10 mins
   - Single-use plastic bottle: 0.082 kg CO2e
   - Landfill municipal waste: 0.58 kg CO2e / kg
3. NEVER treat unknown values as zero. If key variables (like vehicle type, distance, or duration) are missing, apply reasonable standard defaults, clearly state the assumption in "assumptions", and set "clarificationNeeded": true with helpful "followUpQuestions".
4. Calculate "total_carbon_kg" as the sum of all activities' carbon_kg.
5. Compute "eco_score" (0 to 100): High sustainability/low emissions (e.g. <4 kg total) gives score 80-100; moderate (4-12 kg) gives 50-79; high emissions (>15 kg) gives 15-49.
6. Provide a concise, motivating "summary" of their day's environmental impact.
7. Provide 2 to 4 actionable, encouraging "recommendations" tailored to reduce their biggest emission sources.

You MUST respond strictly with valid JSON conforming to this schema (no markdown, no backticks, no comments):
{
  "activities": [
    {
      "category": "transport" | "energy" | "food" | "shopping" | "water" | "waste" | "other",
      "description": "string",
      "distance_km": number | null,
      "duration_hours": number | null,
      "quantity": number | null,
      "unit": "string" | null,
      "carbon_kg": number,
      "assumptions": "string"
    }
  ],
  "total_carbon_kg": number,
  "eco_score": number,
  "summary": "string",
  "recommendations": ["string"],
  "clarificationNeeded": boolean,
  "followUpQuestions": ["string"]
}`;
  }

  /**
   * Primary entry point: Parse natural language daily log using Gemini API
   */
  async analyzeActivities(userPrompt) {
    if (!userPrompt || userPrompt.trim() === '') {
      throw new Error('Activity description prompt cannot be empty');
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      console.warn('[GeminiService] GEMINI_API_KEY is not set. Executing deterministic NLP fallback engine.');
      return this.deterministicNlpAnalysis(userPrompt, 'Fallback NLP Engine (Set GEMINI_API_KEY in server/.env for live Gemini)');
    }

    try {
      const response = await this.callGeminiApi(userPrompt, apiKey);
      const parsedData = this.cleanAndValidateJson(response);
      return {
        ...parsedData,
        aiEngine: 'Google Gemini AI',
        model: this.modelName
      };
    } catch (apiError) {
      console.error('[GeminiService] Gemini API call error:', apiError.message);
      console.log('[GeminiService] Reverting to deterministic estimation engine so service remains uninterrupted.');
      return this.deterministicNlpAnalysis(userPrompt, `Deterministic Fallback (${apiError.message})`);
    }
  }

  /**
   * Call Gemini REST / Generative API endpoint
   */
  async callGeminiApi(prompt, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${this.getSystemInstruction()}\n\nAnalyze this user activity log:\n"${prompt}"` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        responseMimeType: 'application/json'
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Gemini API returned an empty response candidate.');
    }

    return candidateText;
  }

  /**
   * Parse & sanitize JSON returned by AI
   */
  cleanAndValidateJson(rawResponse) {
    let clean = rawResponse.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (err) {
      throw new Error(`Failed to parse Gemini output as JSON: ${err.message}`);
    }

    // Validate activities array
    if (!Array.isArray(parsed.activities) || parsed.activities.length === 0) {
      throw new Error('Gemini response missing valid "activities" array.');
    }

    // Sanitize and ensure numerical values
    let calculatedTotal = 0;
    parsed.activities = parsed.activities.map(item => {
      const carbon = Math.max(0, parseFloat(item.carbon_kg) || 0);
      calculatedTotal += carbon;
      return {
        category: ['transport', 'energy', 'food', 'shopping', 'water', 'waste', 'other'].includes(item.category)
          ? item.category
          : 'other',
        description: item.description || 'Activity',
        distance_km: item.distance_km ? parseFloat(item.distance_km) : null,
        duration_hours: item.duration_hours ? parseFloat(item.duration_hours) : null,
        quantity: item.quantity ? parseFloat(item.quantity) : null,
        unit: item.unit || null,
        carbon_kg: Number(carbon.toFixed(2)),
        assumptions: item.assumptions || 'Estimated using documented DEFRA/EPA factors'
      };
    });

    parsed.total_carbon_kg = Number(calculatedTotal.toFixed(2));
    parsed.eco_score = typeof parsed.eco_score === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.eco_score)))
      : carbonService.computeEcoScore(parsed.total_carbon_kg);

    parsed.summary = parsed.summary || `Extracted ${parsed.activities.length} activities with total footprint of ${parsed.total_carbon_kg} kg CO2e.`;
    parsed.recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
    parsed.clarificationNeeded = Boolean(parsed.clarificationNeeded);
    parsed.followUpQuestions = Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [];

    return parsed;
  }

  /**
   * Deterministic Natural Language Engine (handles offline / no-key mode)
   * Uses regex & documented emission factors so that testing and BCA evaluation
   * works out of the box even before placing an API key.
   */
  deterministicNlpAnalysis(prompt, reasonNote) {
    const text = prompt.toLowerCase();
    const activities = [];
    const followUps = [];

    // 1. Check Transport
    // Examples: "15 km by car", "travelled 20 km in taxi", "drove 30km", "5km bus"
    const carMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:km|kms|kilometers|miles)?\s*(?:by|in|using)?\s*(?:car|drive|driving|taxi|cab|uber)/i) ||
                     text.match(/(?:drove|travelled|traveled|commuted)\s*(\d+(?:\.\d+)?)\s*(?:km|kms|kilometers)/i);
    if (carMatch) {
      const km = parseFloat(carMatch[1]);
      const res = carbonService.calculateTransport({ mode: 'car', distance_km: km });
      activities.push(res);
    } else if (text.includes('car') || text.includes('drove')) {
      // Mentioned car without distance
      followUps.push('How many kilometers did you travel by car today? (Assumed 10 km baseline)');
      activities.push(carbonService.calculateTransport({ mode: 'car', distance_km: 10 }));
    }

    // Bus / Public Transport match
    const busMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:km|kms)?\s*(?:by|in|using)?\s*(?:bus|public transport|transit)/i);
    if (busMatch) {
      const km = parseFloat(busMatch[1]);
      activities.push(carbonService.calculateTransport({ mode: 'bus', distance_km: km }));
    } else if (text.includes('public transport') || text.includes('bus')) {
      activities.push(carbonService.calculateTransport({ mode: 'bus', distance_km: 8 }));
    }

    // Metro / Train match
    const trainMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:km|kms)?\s*(?:by|on|via)?\s*(?:metro|train|subway|rail)/i);
    if (trainMatch) {
      const km = parseFloat(trainMatch[1]);
      activities.push(carbonService.calculateTransport({ mode: 'metro', distance_km: km }));
    }

    // Bike / Walk match
    const walkMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:km|kms)?\s*(?:walk|walked|walking|cycled|bicycled)/i);
    if (walkMatch) {
      const km = parseFloat(walkMatch[1]);
      activities.push(carbonService.calculateTransport({ mode: 'walk', distance_km: km }));
    }

    // 2. Check Energy / AC / Appliance
    // Examples: "used ac for 5 hours", "ac 4 hours", "air conditioner 3 hrs"
    const acMatch = text.match(/(?:ac|air condition(?:er|ing)?)\s*(?:for)?\s*(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)/i) ||
                    text.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)\s*(?:of)?\s*(?:ac|air conditioning)/i);
    if (acMatch) {
      const hours = parseFloat(acMatch[1]);
      activities.push(carbonService.calculateEnergy({ appliance: 'ac', hours }));
    } else if (text.includes('ac') || text.includes('air conditioning')) {
      followUps.push('How many hours was the air conditioner operating? (Assumed 4 hours baseline)');
      activities.push(carbonService.calculateEnergy({ appliance: 'ac', hours: 4 }));
    }

    // Computer / TV
    const pcMatch = text.match(/(?:pc|computer|laptop|gaming)\s*(?:for)?\s*(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)/i);
    if (pcMatch) {
      const hours = parseFloat(pcMatch[1]);
      activities.push(carbonService.calculateEnergy({ appliance: 'computer', hours }));
    }

    // 3. Check Food
    if (text.includes('beef') || text.includes('steak') || text.includes('burger')) {
      activities.push(carbonService.calculateFood({ mealType: 'beef', servings: 1 }));
    } else if (text.includes('chicken') || text.includes('poultry')) {
      activities.push(carbonService.calculateFood({ mealType: 'chicken', servings: 1 }));
    } else if (text.includes('fish') || text.includes('seafood')) {
      activities.push(carbonService.calculateFood({ mealType: 'fish', servings: 1 }));
    } else if (text.includes('salad') || text.includes('vegan') || text.includes('plant')) {
      activities.push(carbonService.calculateFood({ mealType: 'vegan', servings: 1 }));
    } else if (text.includes('lunch') || text.includes('dinner') || text.includes('breakfast') || text.includes('ate')) {
      activities.push(carbonService.calculateFood({ mealType: 'vegetarian', servings: 1 }));
    }

    // 4. Water / Shower
    const showerMatch = text.match(/(\d+)\s*(?:minute|minutes|min)\s*shower/i);
    if (showerMatch) {
      const mins = parseFloat(showerMatch[1]);
      activities.push(carbonService.calculateWater({ type: 'shower', minutes: mins }));
    } else if (text.includes('shower') || text.includes('bath')) {
      activities.push(carbonService.calculateWater({ type: 'shower', minutes: 10 }));
    }

    // 5. Plastic / Shopping
    if (text.includes('plastic bottle')) {
      activities.push(carbonService.calculateShopping({ itemType: 'bottle', quantity: 1 }));
    }

    // If nothing recognized at all, provide a baseline estimate and ask clarification
    if (activities.length === 0) {
      activities.push({
        category: 'other',
        description: `General daily baseline for: "${prompt.slice(0, 50)}..."`,
        carbon_kg: 2.2,
        assumptions: 'Standard human daily living baseline emissions'
      });
      followUps.push('Could you specify travel distance, appliance hours, or meals eaten for a more granular calculation?');
    }

    const totalCarbon = Number(activities.reduce((acc, curr) => acc + curr.carbon_kg, 0).toFixed(2));
    const ecoScore = carbonService.computeEcoScore(totalCarbon);

    // Dynamic recommendations
    const recs = [];
    if (activities.some(a => a.category === 'transport' && a.carbon_kg > 2.0)) {
      recs.push('Switching 1 trip to public transit or carpooling can cut transport emissions by up to 50%.');
    }
    if (activities.some(a => a.category === 'energy' && a.carbon_kg > 1.5)) {
      recs.push('Setting AC temperature to 24°C (75°F) saves up to 18% electricity per degree.');
    }
    if (activities.some(a => a.category === 'food' && a.carbon_kg > 2.0)) {
      recs.push('Replacing 1 red meat meal with lentils, beans, or poultry saves ~4 kg CO2e.');
    }
    if (recs.length === 0) {
      recs.push('Keep maintaining your low-carbon daily choices! Try walking for trips under 2 km.');
    }

    return {
      activities,
      total_carbon_kg: totalCarbon,
      eco_score: ecoScore,
      summary: `Analyzed daily log: Identified ${activities.length} key environmental interactions resulting in ${totalCarbon} kg CO2e.`,
      recommendations: recs,
      clarificationNeeded: followUps.length > 0,
      followUpQuestions: followUps,
      aiEngine: reasonNote
    };
  }

  /**
   * Generate advanced personalized recommendations based on historical activity patterns
   */
  async generatePersonalizedAdvice(historicalSummary) {
    if (!this.isConfigured) {
      return this.deterministicRecommendations(historicalSummary);
    }

    try {
      const prompt = `Based on this user's 30-day carbon footprint profile:
- Total Carbon: ${historicalSummary.totalKg} kg
- Transport emissions: ${historicalSummary.transportKg} kg (${historicalSummary.transportPct}%)
- Energy emissions: ${historicalSummary.energyKg} kg (${historicalSummary.energyPct}%)
- Food emissions: ${historicalSummary.foodKg} kg (${historicalSummary.foodPct}%)
- Top emission source: ${historicalSummary.topCategory}

Generate 4 high-impact, personalized, realistic sustainability recommendations.
Return strictly a JSON array of objects conforming to:
[
  {
    "title": "string",
    "description": "string",
    "category": "transport" | "energy" | "food" | "shopping" | "water" | "waste",
    "estimatedSavingsKg": number,
    "difficulty": "easy" | "medium" | "hard",
    "priority": "low" | "medium" | "high",
    "actionableSteps": ["step 1", "step 2", "step 3"]
  }
]`;

      const raw = await this.callGeminiApi(prompt, process.env.GEMINI_API_KEY);
      let clean = raw.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(clean);
      return Array.isArray(parsed) ? parsed : this.deterministicRecommendations(historicalSummary);
    } catch (e) {
      console.error('[GeminiService] Recommendations generation fallback:', e.message);
      return this.deterministicRecommendations(historicalSummary);
    }
  }

  /**
   * Deterministic personalized recommendations generator
   */
  deterministicRecommendations(summary) {
    const recs = [];

    // Transport recommendation
    if (summary.transportPct >= 30 || summary.transportKg > 15) {
      recs.push({
        title: 'Adopt Hybrid Commute Days',
        description: 'Your transport emissions represent a major share of your footprint. Commuting by bicycle or metro twice a week cuts your weekly emissions substantially.',
        category: 'transport',
        estimatedSavingsKg: 6.8,
        difficulty: 'medium',
        priority: 'high',
        actionableSteps: [
          'Map out the nearest train or bus route for work commutes',
          'Combine multiple errands into a single trip',
          'Consider carpooling or cycling for distances under 4 km'
        ]
      });
    }

    // Energy recommendation
    if (summary.energyPct >= 25 || summary.energyKg > 10) {
      recs.push({
        title: 'Optimize Air Conditioning & Heating',
        description: 'HVAC is typically the highest electricity consumer in households. Setting thermostats to 24-25°C optimizes comfort and power consumption.',
        category: 'energy',
        estimatedSavingsKg: 4.2,
        difficulty: 'easy',
        priority: 'high',
        actionableSteps: [
          'Set AC temperature to 24°C rather than 18°C',
          'Use ceiling fans to circulate cooled air effectively',
          'Clean air filters once every month to preserve efficiency'
        ]
      });
    }

    // Food recommendation
    recs.push({
      title: 'Green Plate & Plant-Forward Dining',
      description: 'Switching 2 lunches per week to wholesome plant-based or vegetarian dishes dramatically lowers agricultural methane and transport impact.',
      category: 'food',
      estimatedSavingsKg: 3.5,
      difficulty: 'easy',
      priority: 'medium',
      actionableSteps: [
        'Designate Mondays as Meatless Green Days',
        'Incorporate protein-dense lentils, chickpeas, and tofu',
        'Source seasonal and regionally grown produce'
      ]
    });

    // Waste / Shopping recommendation
    recs.push({
      title: 'Eliminate Single-Use Plastics',
      description: 'Single-use plastic bottles, cups, and carrier bags accumulate in landfills and produce persistent microplastics.',
      category: 'shopping',
      estimatedSavingsKg: 1.8,
      difficulty: 'easy',
      priority: 'medium',
      actionableSteps: [
        'Carry a stainless steel reusable water bottle',
        'Keep a washable canvas tote in your backpack or car',
        'Avoid single-use plastic cutlery when ordering takeout'
      ]
    });

    return recs;
  }
}

module.exports = new GeminiService();
