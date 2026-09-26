import React, { useState } from 'react';
import { 
  PatientInput, 
  SymptomSeverity 
} from '../types/expert-system';
import { 
  Thermometer, 
  Clock, 
  AlertCircle, 
  User, 
  Activity, 
  ShieldAlert, 
  ArrowRight, 
  Check, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface ClinicalFormProps {
  onSubmit: (input: PatientInput) => void;
  isLoading: boolean;
  initialData?: PatientInput | null;
}

const COMMON_MAIN_SYMPTOMS = [
  'Fever',
  'Cough',
  'Headache',
  'Sore Throat',
  'Abdominal Pain',
  'Vomiting',
  'Diarrhea',
  'Shortness of Breath',
  'Dizziness',
  'Skin Rash',
  'Ear Pain',
  'Body Aches / Fatigue',
  'Chest Pain',
];

const COMMON_ADDITIONAL_SYMPTOMS = [
  'Runny nose',
  'Sneezing',
  'Nasal congestion',
  'Loss of taste/smell',
  'Nausea',
  'Muscle soreness',
  'Chills',
  'Joint stiffness',
  'Hoarseness',
  'Mild wheezing',
  'Loss of appetite',
  'Sinus pressure',
];

const CHRONIC_CONDITIONS = [
  'Asthma / COPD',
  'Diabetes Mellitus',
  'Hypertension',
  'Heart Disease / CAD',
  'Immunocompromised / Chemotherapy',
  'Kidney Disease',
  'None / Healthy',
];

export const ClinicalForm: React.FC<ClinicalFormProps> = ({
  onSubmit,
  isLoading,
  initialData,
}) => {
  const [age, setAge] = useState<number>(initialData?.age || 30);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(initialData?.gender || 'female');
  const [mainSymptom, setMainSymptom] = useState<string>(initialData?.mainSymptom || 'Fever');
  const [customMainSymptom, setCustomMainSymptom] = useState<string>('');
  const [additionalSymptoms, setAdditionalSymptoms] = useState<string[]>(initialData?.additionalSymptoms || ['Cough']);
  const [durationDays, setDurationDays] = useState<number>(initialData?.durationDays || 2);
  const [severity, setSeverity] = useState<SymptomSeverity>(initialData?.severity || 'mild');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [temperatureVal, setTemperatureVal] = useState<number>(initialData?.temperatureC || 38.0);
  const [existingConditions, setExistingConditions] = useState<string[]>(initialData?.existingConditions || []);
  const [isPregnant, setIsPregnant] = useState<boolean>(initialData?.isPregnant || false);
  const [notes, setNotes] = useState<string>(initialData?.notes || '');

  // Red Flag Checkboxes
  const [chestPain, setChestPain] = useState<boolean>(initialData?.chestPain || false);
  const [severeDyspnea, setSevereDyspnea] = useState<boolean>(initialData?.severeDyspnea || false);
  const [stiffNeck, setStiffNeck] = useState<boolean>(initialData?.stiffNeck || false);
  const [suddenWeakness, setSuddenWeakness] = useState<boolean>(initialData?.suddenWeaknessOrNumbness || false);
  const [confusion, setConfusion] = useState<boolean>(initialData?.alteredMentalStatus || false);
  const [bloodInVomitOrStool, setBloodInVomitOrStool] = useState<boolean>(initialData?.bloodInVomitOrStool || false);

  const toggleAdditionalSymptom = (sym: string) => {
    if (additionalSymptoms.includes(sym)) {
      setAdditionalSymptoms(additionalSymptoms.filter((s) => s !== sym));
    } else {
      setAdditionalSymptoms([...additionalSymptoms, sym]);
    }
  };

  const toggleCondition = (cond: string) => {
    if (cond === 'None / Healthy') {
      setExistingConditions([]);
      return;
    }
    const clean = existingConditions.filter((c) => c !== 'None / Healthy');
    if (clean.includes(cond)) {
      setExistingConditions(clean.filter((c) => c !== cond));
    } else {
      setExistingConditions([...clean, cond]);
    }
  };

  const handleApplyPreset = (preset: 'cold' | 'persistent' | 'emergency' | 'pediatric') => {
    if (preset === 'cold') {
      setAge(26);
      setGender('female');
      setMainSymptom('Runny nose');
      setAdditionalSymptoms(['Sneezing', 'Mild headache']);
      setDurationDays(2);
      setSeverity('mild');
      setTemperatureVal(37.1);
      setTempUnit('C');
      setExistingConditions([]);
      setChestPain(false);
      setSevereDyspnea(false);
      setStiffNeck(false);
      setSuddenWeakness(false);
    } else if (preset === 'persistent') {
      setAge(42);
      setGender('male');
      setMainSymptom('Cough');
      setAdditionalSymptoms(['Fatigue', 'Sinus pressure']);
      setDurationDays(9);
      setSeverity('moderate');
      setTemperatureVal(37.6);
      setTempUnit('C');
      setExistingConditions(['Asthma / COPD']);
      setChestPain(false);
      setSevereDyspnea(false);
      setStiffNeck(false);
    } else if (preset === 'emergency') {
      setAge(58);
      setGender('male');
      setMainSymptom('Chest Pain');
      setAdditionalSymptoms(['Shortness of Breath', 'Nausea']);
      setDurationDays(1);
      setSeverity('severe');
      setTemperatureVal(36.8);
      setChestPain(true);
      setSevereDyspnea(true);
      setExistingConditions(['Hypertension', 'Heart Disease / CAD']);
    } else if (preset === 'pediatric') {
      setAge(1);
      setGender('female');
      setMainSymptom('Fever');
      setAdditionalSymptoms(['Loss of appetite', 'Nasal congestion']);
      setDurationDays(1);
      setSeverity('moderate');
      setTemperatureVal(39.7);
      setExistingConditions([]);
      setChestPain(false);
      setSevereDyspnea(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert temp to Celsius if entered in Fahrenheit
    const finalTempC = tempUnit === 'F' 
      ? parseFloat((((temperatureVal - 32) * 5) / 9).toFixed(1))
      : temperatureVal;

    const chosenMainSymptom = customMainSymptom.trim() || mainSymptom;

    const patientData: PatientInput = {
      age,
      gender,
      mainSymptom: chosenMainSymptom,
      additionalSymptoms,
      durationDays,
      severity,
      temperatureC: finalTempC,
      existingConditions,
      isPregnant: gender === 'female' ? isPregnant : false,
      notes,
      chestPain,
      severeDyspnea,
      stiffNeck,
      suddenWeaknessOrNumbness: suddenWeakness,
      alteredMentalStatus: confusion,
      bloodInVomitOrStool,
    };

    onSubmit(patientData);
  };

  const hasAnyRedFlag = chestPain || severeDyspnea || stiffNeck || suddenWeakness || confusion || bloodInVomitOrStool;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Introduction Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Assessment Intake</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Complete the structured health observations below. The Expert System will convert these inputs into a canonical Fact Vector, evaluate them across rule premises, and output an explainable advisory.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Presets:
            </span>
            <button
              type="button"
              onClick={() => handleApplyPreset('cold')}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition-colors cursor-pointer"
            >
              Mild Cold
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('persistent')}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition-colors cursor-pointer"
            >
              Persistent Cough
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('emergency')}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
            >
              Red Flag
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('pediatric')}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition-colors cursor-pointer"
            >
              Pediatric
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Demographics */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">1. Patient Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(e) => setAge(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden transition-all"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {age < 2 ? 'Pediatric high-vulnerability logic applies' : age >= 65 ? 'Geriatric vulnerability modifier applies' : 'Standard adult profile'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Biological Sex
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden transition-all bg-white"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other / Not specified</option>
              </select>
            </div>

            {gender === 'female' && age >= 12 && age <= 55 && (
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPregnant}
                    onChange={(e) => setIsPregnant(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">Currently Pregnant?</span>
                    <span className="text-[10px] text-slate-500 block">Triggers maternal-fetal rule R026</span>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Chief Complaint & Symptoms */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Activity className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">2. Symptoms & Chief Complaint</h2>
          </div>

          {/* Main Symptom */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Primary Chief Complaint (Main Symptom) <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_MAIN_SYMPTOMS.map((sym) => {
                const isSelected = mainSymptom.toLowerCase() === sym.toLowerCase() && !customMainSymptom;
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => {
                      setMainSymptom(sym);
                      setCustomMainSymptom('');
                    }}
                    className={`text-xs px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>

            <div className="mt-3">
              <input
                type="text"
                placeholder="Or type custom main symptom (e.g. Sharp earache, persistent dizzy spells)..."
                value={customMainSymptom}
                onChange={(e) => setCustomMainSymptom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
              />
            </div>
          </div>

          {/* Additional Symptoms */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Accompanying Symptoms (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {COMMON_ADDITIONAL_SYMPTOMS.map((sym) => {
                const active = additionalSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleAdditionalSymptom(sym)}
                    className={`flex items-center justify-between text-xs px-3 py-2 rounded-xl font-medium border transition-all text-left cursor-pointer ${
                      active
                        ? 'bg-teal-50 border-teal-300 text-teal-800'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{sym}</span>
                    {active && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Timeline, Severity & Vitals */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">3. Timeline, Severity & Temperature</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Duration */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Symptom Duration (Days) <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  {durationDays} {durationDays === 1 ? 'day' : 'days'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="21"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1d (Acute)</span>
                <span>4-7d (Subacute)</span>
                <span>&gt;7d (Persistent)</span>
                <span>14d+ (Chronic)</span>
              </div>
              {durationDays > 7 && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 font-medium">
                  Notice: Exceeds 7 days — triggers rule R020 for persistent symptoms.
                </div>
              )}
            </div>

            {/* Severity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Overall Severity Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['mild', 'moderate', 'severe'] as SymptomSeverity[]).map((level) => {
                  const isSel = severity === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeverity(level)}
                      className={`text-xs py-2 px-1 rounded-xl font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        isSel
                          ? level === 'severe'
                            ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                            : level === 'moderate'
                            ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                            : 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {severity === 'mild' && 'Mild: noticeable discomfort, does not interrupt daily tasks.'}
                {severity === 'moderate' && 'Moderate: disrupts normal daily work or sleep.'}
                {severity === 'severe' && 'Severe: incapacitating, cannot manage self-care.'}
              </p>
            </div>

            {/* Body Temperature */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-teal-600" />
                  Body Temperature
                </label>
                <div className="flex items-center text-[10px] font-bold rounded-lg border border-slate-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTempUnit('C')}
                    className={`px-2 py-0.5 ${tempUnit === 'C' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    °C
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempUnit('F')}
                    className={`px-2 py-0.5 ${tempUnit === 'F' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    °F
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.1"
                min={tempUnit === 'C' ? 35.0 : 95.0}
                max={tempUnit === 'C' ? 42.0 : 108.0}
                value={temperatureVal}
                onChange={(e) => setTemperatureVal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {tempUnit === 'C' 
                  ? temperatureVal >= 39.5 ? '⚠️ High fever threshold reached (>39.5°C)' : temperatureVal >= 38.0 ? 'Fever present (≥38.0°C)' : 'Normal temperature'
                  : temperatureVal >= 103.1 ? '⚠️ High fever threshold reached (>103.1°F)' : temperatureVal >= 100.4 ? 'Fever present (≥100.4°F)' : 'Normal temperature'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Critical Red Flags Checklist */}
        <div className={`rounded-2xl p-6 border transition-all ${hasAnyRedFlag ? 'bg-rose-50/70 border-rose-300' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Critical Warning Signs / Red Flags
              </h2>
            </div>
            {hasAnyRedFlag && (
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3 h-3" />
                Red Flag Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2 mb-4">
            Safety Layer Check: If any of these apply, the inference engine will elevate to EMERGENCY or URGENT priority.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${chestPain ? 'bg-rose-100/60 border-rose-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
              <input
                type="checkbox"
                checked={chestPain}
                onChange={(e) => setChestPain(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">Chest Pain or Heavy Pressure</span>
                <span className="text-[11px] text-slate-500 block">Substernal tightness, radiating pain (R001)</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${severeDyspnea ? 'bg-rose-100/60 border-rose-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
              <input
                type="checkbox"
                checked={severeDyspnea}
                onChange={(e) => setSevereDyspnea(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">Severe Shortness of Breath</span>
                <span className="text-[11px] text-slate-500 block">Difficulty speaking, gasping at rest (R002)</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${stiffNeck ? 'bg-rose-100/60 border-rose-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
              <input
                type="checkbox"
                checked={stiffNeck}
                onChange={(e) => setStiffNeck(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">Stiff Neck (Nuchal Rigidity)</span>
                <span className="text-[11px] text-slate-500 block">Inability to flex chin to chest with fever (R004)</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${suddenWeakness ? 'bg-rose-100/60 border-rose-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
              <input
                type="checkbox"
                checked={suddenWeakness}
                onChange={(e) => setSuddenWeakness(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">Sudden Weakness / Numbness (FAST)</span>
                <span className="text-[11px] text-slate-500 block">Facial droop, arm weakness, slurred speech (R003)</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${confusion ? 'bg-rose-100/60 border-rose-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
              <input
                type="checkbox"
                checked={confusion}
                onChange={(e) => setConfusion(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">Sudden Confusion / Disorientation</span>
                <span className="text-[11px] text-slate-500 block">Altered mental status or extreme lethargy (R005)</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${bloodInVomitOrStool ? 'bg-rose-100/60 border-rose-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
              <input
                type="checkbox"
                checked={bloodInVomitOrStool}
                onChange={(e) => setBloodInVomitOrStool(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">Blood in Stool or Vomitus</span>
                <span className="text-[11px] text-slate-500 block">Dark tarry stools or hematemesis (R010)</span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 5: Pre-existing Conditions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">5. Pre-Existing Health Conditions</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CHRONIC_CONDITIONS.map((cond) => {
              const active = existingConditions.includes(cond);
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => toggleCondition(cond)}
                  className={`flex items-center justify-between text-xs px-3 py-2.5 rounded-xl font-medium border transition-all text-left cursor-pointer ${
                    active
                      ? 'bg-teal-50 border-teal-300 text-teal-800'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{cond}</span>
                  {active && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Additional Clinical Notes / Current Medications (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Taking lisinopril for blood pressure; began feeling chills yesterday evening..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('cold')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Standard Intake
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/25 hover:shadow-teal-600/35 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Evaluating Rule Premises...</span>
              </>
            ) : (
              <>
                <span>Run Expert System Inference</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
