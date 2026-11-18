import React, { useState } from 'react';
import {
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  Droplets,
  Trash2,
  Plus,
  Trash,
  Send,
  Loader2,
  Info,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { activityService } from '../../services/activityService';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { formatCarbon } from '../../utils/formatters';

export const CarbonCalculator = ({ onLogged }) => {
  const [activeCategory, setActiveCategory] = useState('transport');
  const [basket, setBasket] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states per category
  const [transportForm, setTransportForm] = useState({ mode: 'car', fuelType: 'petrol', distance_km: 15, passengers: 1 });
  const [energyForm, setEnergyForm] = useState({ appliance: 'ac', hours: 4, kwh: '' });
  const [foodForm, setFoodForm] = useState({ mealType: 'chicken', servings: 1 });
  const [shoppingForm, setShoppingForm] = useState({ itemType: 'cotton_tshirt', quantity: 1 });
  const [waterForm, setWaterForm] = useState({ type: 'shower', minutes: 10, liters: 50 });
  const [wasteForm, setWasteForm] = useState({ wasteType: 'landfill', kg: 1.5 });

  const { showSuccess, showError } = useNotification();
  const { refreshUser } = useAuth();

  // Category configs
  const categories = [
    { key: 'transport', label: 'Transport', icon: Car, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { key: 'energy', label: 'Electricity & AC', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { key: 'food', label: 'Food & Diet', icon: Utensils, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { key: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { key: 'water', label: 'Water Usage', icon: Droplets, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { key: 'waste', label: 'Waste', icon: Trash2, color: 'text-slate-600 bg-slate-100 border-slate-200' }
  ];

  // Helper estimation preview factors
  const estimateCurrentItem = () => {
    switch (activeCategory) {
      case 'transport': {
        const factor = transportForm.mode === 'bus' ? 0.089 : transportForm.mode === 'metro' ? 0.035 : transportForm.fuelType === 'diesel' ? 0.165 : 0.170;
        const total = (parseFloat(transportForm.distance_km || 0) * factor) / (parseInt(transportForm.passengers) || 1);
        return {
          category: 'transport',
          description: `${transportForm.mode} (${transportForm.distance_km} km, ${transportForm.fuelType})`,
          carbon_kg: Number(total.toFixed(2)),
          ...transportForm
        };
      }
      case 'energy': {
        const hours = parseFloat(energyForm.hours || 0);
        const factor = energyForm.appliance === 'ac' ? 0.50 : energyForm.appliance === 'heater' ? 0.95 : 0.07;
        const total = hours * factor;
        return {
          category: 'energy',
          description: `${energyForm.appliance.toUpperCase()} for ${hours} hours`,
          carbon_kg: Number(total.toFixed(2)),
          ...energyForm
        };
      }
      case 'food': {
        const servings = parseInt(foodForm.servings || 1);
        const factor = foodForm.mealType === 'beef' ? 6.61 : foodForm.mealType === 'chicken' ? 1.30 : foodForm.mealType === 'vegan' ? 0.55 : 0.85;
        const total = servings * factor;
        return {
          category: 'food',
          description: `${foodForm.mealType} meal (${servings} serving)`,
          carbon_kg: Number(total.toFixed(2)),
          ...foodForm
        };
      }
      case 'shopping': {
        const qty = parseInt(shoppingForm.quantity || 1);
        const factor = shoppingForm.itemType === 'jeans' ? 20.0 : shoppingForm.itemType === 'bottle' ? 0.082 : 4.5;
        const total = qty * factor;
        return {
          category: 'shopping',
          description: `${qty}x ${shoppingForm.itemType}`,
          carbon_kg: Number(total.toFixed(2)),
          ...shoppingForm
        };
      }
      case 'water': {
        const mins = parseFloat(waterForm.minutes || 10);
        const total = (mins / 10) * 0.45;
        return {
          category: 'water',
          description: `Shower (${mins} min)`,
          carbon_kg: Number(total.toFixed(2)),
          ...waterForm
        };
      }
      case 'waste': {
        const kg = parseFloat(wasteForm.kg || 1);
        const factor = wasteForm.wasteType === 'recycled' ? 0.08 : 0.58;
        const total = kg * factor;
        return {
          category: 'waste',
          description: `${kg} kg ${wasteForm.wasteType} waste`,
          carbon_kg: Number(total.toFixed(2)),
          ...wasteForm
        };
      }
      default:
        return { category: 'other', description: 'Item', carbon_kg: 1.0 };
    }
  };

  const handleAddToBasket = () => {
    const item = estimateCurrentItem();
    setBasket((prev) => [...prev, item]);
    showSuccess(`Added "${item.description}" (${item.carbon_kg} kg CO2e) to calculation tray!`);
  };

  const handleRemoveItem = (index) => {
    setBasket((prev) => prev.filter((_, i) => i !== index));
  };

  const totalBasketCarbon = Number(basket.reduce((acc, item) => acc + item.carbon_kg, 0).toFixed(2));

  const handleSaveToDatabase = async () => {
    if (basket.length === 0) {
      showError('Please add at least one item to your calculation tray.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await activityService.logManual(basket, `Manual Calculator (${basket.length} items)`);
      if (res.success) {
        showSuccess(`Saved to MongoDB! Total emissions: ${res.activity.total_carbon_kg} kg CO2e (+15 Eco Points).`);
        setBasket([]);
        await refreshUser();
        if (onLogged) onLogged(res.activity);
      }
    } catch (err) {
      showError(err.message || 'Failed to save calculator entries');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Category Input Controls */}
      <div className="lg:col-span-2 space-y-6">
        {/* Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = activeCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-forest-800 text-white border-forest-900 shadow-md font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-300' : 'text-slate-500'}`} />
                <span className="text-xs">{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Category Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 capitalize">
              {categories.find((c) => c.key === activeCategory)?.label} Calculation
            </h3>
            <p className="text-xs text-slate-500">
              Enter your specific activity measurements based on IPCC & DEFRA standards
            </p>
          </div>

          {/* Transportation */}
          {activeCategory === 'transport' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mode of Travel</label>
                <select
                  value={transportForm.mode}
                  onChange={(e) => setTransportForm({ ...transportForm, mode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                >
                  <option value="car">Personal Car</option>
                  <option value="bus">Public Bus</option>
                  <option value="metro">Train / Metro</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="bicycle">Bicycle (Zero tailpipe)</option>
                  <option value="walk">Walking (Zero direct)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Engine / Fuel Type</label>
                <select
                  value={transportForm.fuelType}
                  onChange={(e) => setTransportForm({ ...transportForm, fuelType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                >
                  <option value="petrol">Petrol / Gasoline (0.17 kg/km)</option>
                  <option value="diesel">Diesel (0.165 kg/km)</option>
                  <option value="electric">Electric (0.047 kg/km grid)</option>
                  <option value="hybrid">Hybrid (0.105 kg/km)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Distance (Kilometers)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={transportForm.distance_km}
                  onChange={(e) => setTransportForm({ ...transportForm, distance_km: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Passengers (Carpool sharing)</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={transportForm.passengers}
                  onChange={(e) => setTransportForm({ ...transportForm, passengers: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                />
              </div>
            </div>
          )}

          {/* Energy */}
          {activeCategory === 'energy' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Appliance Type</label>
                <select
                  value={energyForm.appliance}
                  onChange={(e) => setEnergyForm({ ...energyForm, appliance: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                >
                  <option value="ac">Air Conditioner 1.5kW (~0.50 kg/hr)</option>
                  <option value="heater">Electric Space Heater (~0.95 kg/hr)</option>
                  <option value="computer">Desktop Computer (~0.07 kg/hr)</option>
                  <option value="laptop">Laptop (~0.02 kg/hr)</option>
                  <option value="tv">Television LED (~0.05 kg/hr)</option>
                  <option value="geyser">Water Heater Geyser (~1.50 kg/hr)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Hours</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={energyForm.hours}
                  onChange={(e) => setEnergyForm({ ...energyForm, hours: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                />
              </div>
            </div>
          )}

          {/* Food */}
          {activeCategory === 'food' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meal / Diet Composition</label>
                <select
                  value={foodForm.mealType}
                  onChange={(e) => setFoodForm({ ...foodForm, mealType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                >
                  <option value="beef">Beef / Red Meat (6.61 kg/serving)</option>
                  <option value="chicken">Poultry / Chicken (1.30 kg/serving)</option>
                  <option value="fish">Fish / Seafood (1.10 kg/serving)</option>
                  <option value="vegetarian">Vegetarian Grain/Dairy (0.85 kg/serving)</option>
                  <option value="vegan">Vegan Plant-Based (0.55 kg/serving)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Servings Count</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={foodForm.servings}
                  onChange={(e) => setFoodForm({ ...foodForm, servings: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                />
              </div>
            </div>
          )}

          {/* Shopping */}
          {activeCategory === 'shopping' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purchased Item</label>
                <select
                  value={shoppingForm.itemType}
                  onChange={(e) => setShoppingForm({ ...shoppingForm, itemType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                >
                  <option value="cotton_tshirt">Cotton T-Shirt (~4.5 kg)</option>
                  <option value="jeans">Pair of Denim Jeans (~20.0 kg)</option>
                  <option value="bottle">Single-Use Plastic Bottle (~0.082 kg)</option>
                  <option value="delivery_box">Online E-commerce Box (~0.30 kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={shoppingForm.quantity}
                  onChange={(e) => setShoppingForm({ ...shoppingForm, quantity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                />
              </div>
            </div>
          )}

          {/* Water */}
          {activeCategory === 'water' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Water Activity</label>
                <select
                  value={waterForm.type}
                  onChange={(e) => setWaterForm({ ...waterForm, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                >
                  <option value="shower">Warm Water Shower (~0.45 kg / 10m)</option>
                  <option value="bath">Full Bath Tub (~0.90 kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shower Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={waterForm.minutes}
                  onChange={(e) => setWaterForm({ ...waterForm, minutes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                />
              </div>
            </div>
          )}

          {/* Waste */}
          {activeCategory === 'waste' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Disposal Method</label>
                <select
                  value={wasteForm.wasteType}
                  onChange={(e) => setWasteForm({ ...wasteForm, wasteType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                >
                  <option value="landfill">Mixed Municipal Landfill (0.58 kg/kg)</option>
                  <option value="recycled">Recycled Sorting (0.08 kg/kg)</option>
                  <option value="composted">Organic Compost (0.05 kg/kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={wasteForm.kg}
                  onChange={(e) => setWasteForm({ ...wasteForm, kg: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-forest-600"
                />
              </div>
            </div>
          )}

          {/* Add to Tray Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleAddToBasket}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Calculation Tray</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calculation Tray / Basket Sidebar */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Calculation Tray</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {basket.length} {basket.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {basket.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <Info className="w-6 h-6 mx-auto text-slate-300" />
              <p>Your calculation tray is currently empty. Configure items on the left and click "Add to Tray".</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {basket.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <div className="font-semibold text-slate-900 truncate">{item.description}</div>
                    <span className="text-slate-500 capitalize">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-forest-800">{formatCarbon(item.carbon_kg)}</span>
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subtotal & Save */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-slate-600">Total Tray Carbon:</span>
              <span className="text-xl font-extrabold text-forest-900">{formatCarbon(totalBasketCarbon)}</span>
            </div>

            <button
              onClick={handleSaveToDatabase}
              disabled={isSubmitting || basket.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>Saving to MongoDB...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Save Log & Earn +15 Pts</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
