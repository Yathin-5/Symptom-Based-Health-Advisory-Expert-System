import React, { useState } from 'react';
import { NutrientProfile, NutrientFoodSource } from '../types/nutrition';
import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  AlertCircle, 
  Apple, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  Info,
  ChevronDown,
  ChevronUp,
  Leaf,
  Fish,
  Utensils
} from 'lucide-react';

interface NutrientCardProps {
  nutrient: NutrientProfile;
  onSelectNutrient?: (name: string) => void;
}

export const NutrientCard: React.FC<NutrientCardProps> = ({ nutrient, onSelectNutrient }) => {
  const [filter, setFilter] = useState<'all' | 'vegan' | 'vegetarian' | 'seafood' | 'meat' | 'dairy'>('all');
  const [showAllBioTips, setShowAllBioTips] = useState<boolean>(false);

  // Filter foods while preserving descending sorted order by dailyValuePercentage
  const filteredFoods = nutrient.foodSourcesSorted.filter((food) => {
    if (filter === 'all') return true;
    if (filter === 'vegan') return food.dietaryTags.includes('vegan') || food.category === 'plant_based';
    if (filter === 'vegetarian') return food.dietaryTags.includes('vegetarian') || food.dietaryTags.includes('vegan') || food.category === 'dairy' || food.category === 'plant_based';
    if (filter === 'seafood') return food.category === 'seafood' || food.dietaryTags.includes('pescatarian');
    if (filter === 'meat') return food.category === 'meat';
    if (filter === 'dairy') return food.category === 'dairy';
    return true;
  });

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800/90 space-y-4 font-sans text-left">
      {/* Nutrient Header Card */}
      <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-emerald-950/70 via-zinc-900/90 to-teal-950/50 border border-emerald-700/50 shadow-xl shadow-emerald-950/30">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Apple className="w-3 h-3 text-emerald-400" />
              Nutritional Profile & Food Enrichment
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
              {nutrient.type.toUpperCase()}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-800/80">
              Adult RDA: {nutrient.rdaAdults.split('(')[0].trim()}
            </span>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
          <span>{nutrient.name}</span>
          {nutrient.chemicalName && (
            <span className="text-xs sm:text-sm font-semibold text-emerald-400/90">
              ({nutrient.chemicalName})
            </span>
          )}
        </h3>

        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
          Comprehensive clinical guide detailing biological necessity in human physiology, deficiency warning signs, and dietary foods ranked in descending order of enrichment percentage.
        </p>
      </div>

      {/* 1. What It Does to Our Body */}
      <div className="rounded-2xl p-4 bg-zinc-950/90 border border-zinc-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>What It Does to Our Body (Biological Functions)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {nutrient.whatItDoesInBody.map((role, rIdx) => {
            const parts = role.split(':');
            const title = parts.length > 1 ? parts[0] : `Role ${rIdx + 1}`;
            const desc = parts.length > 1 ? parts.slice(1).join(':') : role;
            return (
              <div
                key={rIdx}
                className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{title}</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed pl-5.5">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Deficiency Warning Signs */}
      <div className="rounded-2xl p-4 bg-zinc-950/90 border border-amber-900/40 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Deficiency Warning Signs & Health Risks</span>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
          {nutrient.deficiencyRisks.map((risk, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
              <span className="text-amber-400 font-bold shrink-0 mt-0.5">&bull;</span>
              <span className="text-[11px] text-zinc-300 leading-snug">{risk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Possible Ways to Consume: Foods in Sorted Order by % DV */}
      <div className="rounded-2xl p-4 sm:p-5 bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>Foods Ranked by Enrichment Percentage (Sorted Descending)</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Ranked in descending order of Daily Value (% DV) per standard portion size.
            </p>
          </div>

          {/* Dietary Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
            {[
              { id: 'all', label: 'All Sources', icon: Utensils },
              { id: 'vegan', label: 'Vegan / Plant', icon: Leaf },
              { id: 'vegetarian', label: 'Vegetarian', icon: Apple },
              { id: 'seafood', label: 'Seafood', icon: Fish },
              { id: 'meat', label: 'Meat & Poultry', icon: Utensils },
              { id: 'dairy', label: 'Dairy', icon: Apple },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilter(btn.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  filter === btn.id
                    ? 'bg-emerald-600 text-black shadow-sm'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Food List */}
        <div className="space-y-2">
          {filteredFoods.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-zinc-900/50 text-zinc-400 text-xs">
              No food items match the selected dietary filter for {nutrient.name}. Try selecting "All Sources".
            </div>
          ) : (
            filteredFoods.map((food, fIdx) => {
              // Calculate relative bar width clamped between 10% and 100%
              const maxDv = Math.max(100, filteredFoods[0]?.dailyValuePercentage || 100);
              const barWidthPercent = Math.min(100, Math.max(12, (food.dailyValuePercentage / maxDv) * 100));

              return (
                <div
                  key={fIdx}
                  className="p-3 sm:p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/50 transition-all space-y-2 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-400 flex items-center justify-center text-[10px] font-mono font-bold">
                        #{fIdx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                        {food.name}
                      </h4>
                      {/* Dietary Badges */}
                      <div className="flex items-center gap-1">
                        {food.dietaryTags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              tag === 'vegan'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : tag === 'vegetarian'
                                ? 'bg-teal-950 text-teal-300 border border-teal-800'
                                : tag === 'pescatarian'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* % DV Pill */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {food.amount} / {food.serving}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-600/80 font-black text-xs font-mono shadow-xs">
                        {food.dailyValuePercentage.toLocaleString()}% DV
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar representation */}
                  <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full"
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  </div>

                  {/* Clinical Food Note */}
                  {food.notes && (
                    <p className="text-[10px] text-zinc-400 leading-tight flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{food.notes}</span>
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Consumption & Bioavailability Advice */}
      <div className="rounded-2xl p-4 bg-zinc-950/90 border border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Optimal Ways to Consume & Absorb for Our Body</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAllBioTips(!showAllBioTips)}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>{showAllBioTips ? 'Collapse' : 'Expand Details'}</span>
            {showAllBioTips ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <ul className="space-y-1.5 text-xs text-zinc-300">
          {(showAllBioTips
            ? nutrient.consumptionAndBioavailabilityAdvice
            : nutrient.consumptionAndBioavailabilityAdvice.slice(0, 2)
          ).map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
              <span className="text-[11px] text-zinc-300 leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>

        {nutrient.interactionTips && nutrient.interactionTips.length > 0 && showAllBioTips && (
          <div className="pt-2 border-t border-zinc-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Synergies & Antagonist Interactions:
            </span>
            <ul className="space-y-1 text-[11px] text-zinc-400">
              {nutrient.interactionTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 5. Quick Nutrient Discovery Switcher */}
      <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-zinc-400 font-medium">
          Explore another nutrient or food enrichment profile:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {['Vitamin B12', 'Vitamin D', 'Iron', 'Magnesium', 'Zinc', 'Vitamin C'].map((nutName) => (
            <button
              key={nutName}
              type="button"
              onClick={() => onSelectNutrient && onSelectNutrient(nutName)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-600 border border-zinc-700 text-zinc-300 text-[10px] font-bold transition-all cursor-pointer"
            >
              {nutName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
