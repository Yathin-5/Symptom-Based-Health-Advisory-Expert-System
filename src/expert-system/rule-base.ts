import { RuleDefinition } from '../types/expert-system';

export const RULE_BASE: RuleDefinition[] = [
  // ==========================================
  // EMERGENCY RULES (Priority: 90 - 100)
  // ==========================================
  {
    id: 'R001',
    name: 'Acute Coronary Syndrome / Severe Chest Pain Alert',
    priority: 100,
    category: 'Cardiovascular',
    logic: 'ALL',
    conditions: [
      { factKey: 'chest_pain', operator: 'is_true', value: true, description: 'Chest pain or pressure reported' },
    ],
    result: {
      riskLevel: 'EMERGENCY',
      advisoryCategory: 'Cardiovascular Emergency',
      recommendedCare: 'EMERGENCY_ROOM',
      actionSummary: 'Call emergency medical services (911 / 112) immediately. Do not drive yourself to the hospital.',
      clinicalRationale: 'Unexplained acute chest pain or pressure is a cardinal warning sign for acute myocardial infarction, pulmonary embolism, or aortic dissection.',
      guidelineReference: 'AHA/ACC Chest Pain Guidelines & Triage Protocol',
    },
  },
  {
    id: 'R002',
    name: 'Acute Severe Respiratory Distress Protocol',
    priority: 98,
    category: 'Respiratory',
    logic: 'ALL',
    conditions: [
      { factKey: 'shortness_of_breath', operator: 'is_true', value: true, description: 'Shortness of breath / dyspnea reported' },
      { factKey: 'severity_severe', operator: 'is_true', value: true, description: 'Severity is rated as severe' },
    ],
    result: {
      riskLevel: 'EMERGENCY',
      advisoryCategory: 'Severe Respiratory Distress',
      recommendedCare: 'EMERGENCY_ROOM',
      actionSummary: 'Call emergency services right away. Sit upright and loosen tight clothing while waiting for medical help.',
      clinicalRationale: 'Severe dyspnea combined with rapid onset indicates potential respiratory failure, severe asthma exacerbation, or tension pneumothorax.',
      guidelineReference: 'WHO Emergency Triage Assessment and Treatment (ETAT)',
    },
  },
  {
    id: 'R003',
    name: 'Acute Focal Neurological Deficit (FAST Stroke Warning)',
    priority: 97,
    category: 'Neurological',
    logic: 'ALL',
    conditions: [
      { factKey: 'sudden_weakness', operator: 'is_true', value: true, description: 'Sudden weakness, facial droop, or arm numbness' },
    ],
    result: {
      riskLevel: 'EMERGENCY',
      advisoryCategory: 'Acute Cerebrovascular Deficit',
      recommendedCare: 'EMERGENCY_ROOM',
      actionSummary: 'Activate emergency medical dispatch immediately. Time is critical for thrombolytic or thrombectomy interventions.',
      clinicalRationale: 'Sudden focal weakness or hemi-paresis conforms to the FAST criteria for acute ischemic stroke or intracranial hemorrhage.',
      guidelineReference: 'American Stroke Association Acute Ischemic Stroke Guidelines',
    },
  },
  {
    id: 'R004',
    name: 'Meningeal Irritation Red Flag (Nuchal Rigidity + Fever)',
    priority: 95,
    category: 'Neurological',
    logic: 'ALL',
    conditions: [
      { factKey: 'stiff_neck', operator: 'is_true', value: true, description: 'Stiff neck (nuchal rigidity)' },
      { factKey: 'fever', operator: 'is_true', value: true, description: 'Presence of fever' },
    ],
    result: {
      riskLevel: 'EMERGENCY',
      advisoryCategory: 'Suspected Central Nervous System Infection',
      recommendedCare: 'EMERGENCY_ROOM',
      actionSummary: 'Seek emergency hospital admission immediately. Prompt lumbar puncture and parenteral antimicrobial therapy may be life-saving.',
      clinicalRationale: 'The combination of fever with true neck stiffness is highly specific for acute bacterial meningitis or subarachnoid hemorrhage with secondary meningismus.',
      guidelineReference: 'IDSA Guidelines for the Management of Bacterial Meningitis',
    },
  },
  {
    id: 'R005',
    name: 'Altered Sensorium with Fever / Systemic Infection',
    priority: 92,
    category: 'Systemic',
    logic: 'ALL',
    conditions: [
      { factKey: 'confusion', operator: 'is_true', value: true, description: 'Confusion or altered mental status' },
      { factKey: 'fever', operator: 'is_true', value: true, description: 'Presence of fever' },
    ],
    result: {
      riskLevel: 'EMERGENCY',
      advisoryCategory: 'Severe Sepsis / Encephalopathy Warning',
      recommendedCare: 'EMERGENCY_ROOM',
      actionSummary: 'Go to the nearest emergency department immediately. This requires urgent hemodynamic and neurological evaluation.',
      clinicalRationale: 'Acute delirium or altered mentation in the context of hyperthermia is a primary qSOFA indicator of sepsis or acute encephalitis.',
      guidelineReference: 'Surviving Sepsis Campaign International Guidelines',
    },
  },

  // ==========================================
  // URGENT RULES (Priority: 70 - 89)
  // ==========================================
  {
    id: 'R010',
    name: 'Acute Gastrointestinal Hemorrhage Warning',
    priority: 85,
    category: 'Gastrointestinal',
    logic: 'ALL',
    conditions: [
      { factKey: 'blood_in_stool_or_vomit', operator: 'is_true', value: true, description: 'Visible blood in stool or vomit' },
    ],
    result: {
      riskLevel: 'URGENT',
      advisoryCategory: 'Gastrointestinal Bleeding',
      recommendedCare: 'URGENT_CARE',
      actionSummary: 'Seek urgent clinical evaluation within hours. Do not take aspirin, ibuprofen, or NSAIDs.',
      clinicalRationale: 'Gastrointestinal bleeding indicates active mucosal ulceration, Mallory-Weiss tear, diverticular hemorrhage, or vascular malformation.',
      guidelineReference: 'ACG Clinical Guideline: Upper and Lower GI Bleeding',
    },
  },
  {
    id: 'R011',
    name: 'Moderate Dyspnea or Exertional Breathing Difficulty',
    priority: 82,
    category: 'Respiratory',
    logic: 'ALL',
    conditions: [
      { factKey: 'shortness_of_breath', operator: 'is_true', value: true, description: 'Breathing difficulty reported' },
    ],
    result: {
      riskLevel: 'URGENT',
      advisoryCategory: 'Acute Respiratory Evaluation',
      recommendedCare: 'URGENT_CARE',
      actionSummary: 'Seek prompt evaluation at an urgent care clinic today. Avoid strenuous exertion.',
      clinicalRationale: 'Any non-severe shortness of breath warrants timely medical auscultation, pulse oximetry, and chest radiography to prevent decompensation.',
      guidelineReference: 'BTS / NICE Respiratory Assessment Standards',
    },
  },
  {
    id: 'R012',
    name: 'Severe Dehydration Risk from Intractable Vomiting/Diarrhea',
    priority: 80,
    category: 'Gastrointestinal',
    logic: 'ALL',
    conditions: [
      { factKey: 'unable_to_keep_fluids', operator: 'is_true', value: true, description: 'Unable to retain liquids for over 24 hours' },
    ],
    result: {
      riskLevel: 'URGENT',
      advisoryCategory: 'Dehydration / Acute Gastroenteritis Complication',
      recommendedCare: 'URGENT_CARE',
      actionSummary: 'Seek same-day medical attention for intravenous or supervised oral rehydration therapy and antiemetic treatment.',
      clinicalRationale: 'Complete inability to tolerate oral fluids for 24+ hours predisposes to acute kidney injury and critical electrolyte disturbances.',
      guidelineReference: 'CDC Fluid Replacement and Gastroenteritis Protocol',
    },
  },
  {
    id: 'R013',
    name: 'Acute Severe Abdominal Pain / Appendicitis Warning',
    priority: 78,
    category: 'Gastrointestinal',
    logic: 'ALL',
    conditions: [
      { factKey: 'abdominal_pain', operator: 'is_true', value: true, description: 'Abdominal pain present' },
      { factKey: 'severity_severe', operator: 'is_true', value: true, description: 'Severity rated as severe' },
    ],
    result: {
      riskLevel: 'URGENT',
      advisoryCategory: 'Acute Abdomen Evaluation',
      recommendedCare: 'URGENT_CARE',
      actionSummary: 'Have an urgent surgical/medical assessment today. Fast from food and liquids until evaluated by a clinician.',
      clinicalRationale: 'Severe acute abdominal pain can signal acute appendicitis, bowel obstruction, pancreatitis, or perforated viscus.',
      guidelineReference: 'World Society of Emergency Surgery (WSES) Acute Abdomen Guidelines',
    },
  },
  {
    id: 'R014',
    name: 'High Pyrexia in Vulnerable Patient (Infant or High Fever)',
    priority: 76,
    category: 'Systemic',
    logic: 'ANY',
    conditions: [
      { factKey: 'high_fever', operator: 'is_true', value: true, description: 'Temperature > 39.5°C (103.1°F)' },
      { factKey: 'infant_with_fever', operator: 'is_true', value: true, description: 'Child under 2 years old with active fever' },
    ],
    result: {
      riskLevel: 'URGENT',
      advisoryCategory: 'High Hyperpyrexia / Pediatric Vulnerability',
      recommendedCare: 'URGENT_CARE',
      actionSummary: 'Contact your pediatrician or visit an urgent care center promptly. Monitor hydration and alert for febrile seizures.',
      clinicalRationale: 'Extreme fever or fever in infants carries an elevated risk of occult bacteremia, urinary tract infection, or pneumonia.',
      guidelineReference: 'AAP Pediatric Febrile Illness Clinical Practice Guideline',
    },
  },
  {
    id: 'R015',
    name: 'Elderly Comorbid Patient with Respiratory Infection',
    priority: 72,
    category: 'Respiratory',
    logic: 'ALL',
    conditions: [
      { factKey: 'age_elderly', operator: 'is_true', value: true, description: 'Patient is 65 years or older' },
      { factKey: 'cough', operator: 'is_true', value: true, description: 'Cough present' },
      { factKey: 'has_chronic_disease', operator: 'is_true', value: true, description: 'Has chronic health conditions' },
    ],
    result: {
      riskLevel: 'URGENT',
      advisoryCategory: 'High-Risk Geriatric Respiratory Illness',
      recommendedCare: 'URGENT_CARE',
      actionSummary: 'Schedule an urgent clinical evaluation within 24 hours. Monitor blood oxygen levels if an oximeter is available.',
      clinicalRationale: 'Older adults with coexisting chronic conditions have diminished physiological reserve and high mortality risks from lower respiratory tract infections.',
      guidelineReference: 'ATS/IDSA Community-Acquired Pneumonia Guidelines in Elderly Patients',
    },
  },

  // ==========================================
  // MODERATE RULES (Priority: 40 - 69)
  // ==========================================
  {
    id: 'R020',
    name: 'Persistent Symptoms Exceeding Typical Viral Window (> 7 days)',
    priority: 65,
    category: 'Systemic',
    logic: 'ALL',
    conditions: [
      { factKey: 'duration_persistent', operator: 'is_true', value: true, description: 'Symptoms have lasted longer than 7 days' },
    ],
    result: {
      riskLevel: 'MODERATE',
      advisoryCategory: 'Prolonged Illness Evaluation',
      recommendedCare: 'PRIMARY_CARE',
      actionSummary: 'Schedule an appointment with a primary care physician. Do not simply wait for self-resolution.',
      clinicalRationale: 'Uncomplicated upper respiratory and viral syndromes generally demonstrate steady improvement within 5 to 7 days; persistence points toward secondary bacterial infection, sinusitis, or chronic pathology.',
      guidelineReference: 'NICE Clinical Knowledge Summaries: Prolonged Upper Respiratory Infection',
    },
  },
  {
    id: 'R021',
    name: 'Subacute Respiratory Illness with Productive Cough',
    priority: 60,
    category: 'Respiratory',
    logic: 'ALL',
    conditions: [
      { factKey: 'cough', operator: 'is_true', value: true, description: 'Cough present' },
      { factKey: 'fever', operator: 'is_true', value: true, description: 'Fever present' },
      { factKey: 'duration_subacute', operator: 'is_true', value: true, description: 'Duration 4 to 7 days' },
    ],
    result: {
      riskLevel: 'MODERATE',
      advisoryCategory: 'Acute Bronchitis / Tracheobronchial Infection',
      recommendedCare: 'PRIMARY_CARE',
      actionSummary: 'Book a medical consultation within 1 to 2 days. Rest, maintain high oral hydration, and avoid irritants/smoke.',
      clinicalRationale: 'Fever paired with a persistent cough entering day 4-7 requires lung auscultation to rule out early consolidated pneumonia or purulent bronchitis.',
      guidelineReference: 'CDC Core Elements of Outpatient Antibiotic Stewardship',
    },
  },
  {
    id: 'R022',
    name: 'Prolonged or Moderate Gastroenteritis',
    priority: 55,
    category: 'Gastrointestinal',
    logic: 'ALL',
    conditions: [
      { factKey: 'diarrhea', operator: 'is_true', value: true, description: 'Diarrhea present' },
      { factKey: 'abdominal_pain', operator: 'is_true', value: true, description: 'Abdominal pain present' },
    ],
    result: {
      riskLevel: 'MODERATE',
      advisoryCategory: 'Acute Infectious Gastroenteritis',
      recommendedCare: 'PRIMARY_CARE',
      actionSummary: 'Consult a primary healthcare provider if not resolving in 48 hours. Drink oral rehydration solution (ORS) with electrolytes.',
      clinicalRationale: 'Combined diarrhea and cramping abdominal pain suggest viral or bacterial gastroenteritis requiring electrolyte replenishment and monitoring for dehydration.',
      guidelineReference: 'World Gastroenterology Organisation (WGO) Acute Diarrhea Guidelines',
    },
  },
  {
    id: 'R023',
    name: 'Moderate Cephalea with Sinus / Tension Characteristics',
    priority: 50,
    category: 'Neurological',
    logic: 'ALL',
    conditions: [
      { factKey: 'headache', operator: 'is_true', value: true, description: 'Headache present' },
      { factKey: 'severity_moderate', operator: 'is_true', value: true, description: 'Moderate pain severity' },
    ],
    result: {
      riskLevel: 'MODERATE',
      advisoryCategory: 'Tension / Sinus Headache Syndrome',
      recommendedCare: 'PRIMARY_CARE',
      actionSummary: 'Schedule non-urgent doctor consultation if symptoms persist over 3 days. Rest in a quiet, dimmed room and maintain adequate hydration.',
      clinicalRationale: 'Moderate headache without neurological focal deficits or meningismus generally reflects tension, migraine, or sinus congestion, but merits clinical review if refractory to simple analgesics.',
      guidelineReference: 'International Headache Society (IHS) Classification Criteria',
    },
  },
  {
    id: 'R024',
    name: 'Febrile Exanthem / Rash with Fever',
    priority: 52,
    category: 'Dermatological',
    logic: 'ALL',
    conditions: [
      { factKey: 'skin_rash', operator: 'is_true', value: true, description: 'Skin rash present' },
      { factKey: 'fever', operator: 'is_true', value: true, description: 'Fever present' },
    ],
    result: {
      riskLevel: 'MODERATE',
      advisoryCategory: 'Febrile Exanthem Syndrome',
      recommendedCare: 'PRIMARY_CARE',
      actionSummary: 'See a physician or dermatologist for diagnostic inspection. Perform the glass tumbler test to check if rash blanches under pressure.',
      clinicalRationale: 'Fever co-occurring with an acute exanthem requires direct visual inspection to differentiate self-limiting viral rash from drug eruptions or meningococcal disease.',
      guidelineReference: 'British Association of Dermatologists Guidelines on Acute Rash with Fever',
    },
  },
  {
    id: 'R025',
    name: 'Acute Otalgia / Suspected Middle Ear Infection',
    priority: 45,
    category: 'Respiratory',
    logic: 'ALL',
    conditions: [
      { factKey: 'ear_pain', operator: 'is_true', value: true, description: 'Ear pain reported' },
    ],
    result: {
      riskLevel: 'MODERATE',
      advisoryCategory: 'Acute Otitis Media / Otitis Externa',
      recommendedCare: 'PRIMARY_CARE',
      actionSummary: 'Visit an outpatient doctor or ENT specialist for otoscopic examination. Keep the ear canal dry.',
      clinicalRationale: 'Ear pain requires direct visual inspection of the tympanic membrane to determine if antibiotic or topical drops are indicated.',
      guidelineReference: 'AAO-HNS Otitis Media Guidelines',
    },
  },
  {
    id: 'R026',
    name: 'Pregnancy with Acute Symptomatology',
    priority: 68,
    category: 'Systemic',
    logic: 'ALL',
    conditions: [
      { factKey: 'is_pregnant', operator: 'is_true', value: true, description: 'Patient is pregnant' },
      { factKey: 'fever', operator: 'is_true', value: true, description: 'Fever is present' },
    ],
    result: {
      riskLevel: 'MODERATE',
      advisoryCategory: 'Maternal-Fetal Health Advisory',
      recommendedCare: 'PRIMARY_CARE',
      actionSummary: 'Contact your obstetrician or midwife within 24 hours. Do not take medications without consulting your obstetric provider.',
      clinicalRationale: 'Pyrexia in pregnancy may affect fetal development or indicate chorioamnionitis or pyelonephritis requiring specialized maternal care.',
      guidelineReference: 'ACOG Practice Bulletin on Infectious Diseases in Pregnancy',
    },
  },
  {
    id: 'R027',
    name: 'Peripheral Paresthesia & Neuropathy Alert (Tingling / Numbness)',
    priority: 50,
    category: 'Neurological',
    logic: 'ALL',
    conditions: [
      { factKey: 'tingling_numbness', operator: 'is_true', value: true, description: 'Tingling or numbness in extremities' },
    ],
    result: {
      riskLevel: 'MODERATE',
      advisoryCategory: 'Peripheral Neuropathy / Micronutrient Deficiency Evaluation',
      recommendedCare: 'PRIMARY_CARE',
      actionSummary: 'Schedule an outpatient medical consultation. Request blood lab panels for Vitamin B12, folate, fasting glucose, and electrolytes. Avoid repetitive joint/nerve compression.',
      clinicalRationale: 'Pins-and-needles paresthesia in hands or feet is a hallmark clinical indicator of Vitamin B12 deficiency (subacute combined degeneration), diabetic peripheral neuropathy, or spinal nerve root irritation.',
      guidelineReference: 'American Academy of Neurology (AAN) Distal Symmetric Polyneuropathy Guidelines',
    },
  },
  {
    id: 'R028',
    name: 'Musculoskeletal Arthralgia / Joint or Back Pain',
    priority: 38, // BUG-04 fix: was 42 (MODERATE tier 40-69) but riskLevel is LOW; corrected to 38 (LOW tier 10-39)
    category: 'Musculoskeletal',
    logic: 'ALL',
    conditions: [
      { factKey: 'joint_pain', operator: 'is_true', value: true, description: 'Joint, knee, or back pain reported' },
    ],
    result: {
      riskLevel: 'LOW',
      advisoryCategory: 'Musculoskeletal Strain / Joint Discomfort',
      recommendedCare: 'SELF_CARE',
      actionSummary: 'Rest the affected joint, apply cold compresses for acute swelling (or gentle warmth for muscle stiffness), avoid heavy loading, and maintain gentle posture.',
      clinicalRationale: 'Joint or back discomfort in the absence of neurological red flags (saddle anesthesia, bowel/bladder loss) or systemic fever typically represents mechanical strain or localized inflammation.',
      guidelineReference: 'NICE Clinical Guidelines on Low Back Pain and Osteoarthritis Management',
    },
  },
  {
    id: 'R029',
    name: 'Dyspepsia / Gastroesophageal Acid Reflux Protocol',
    priority: 28, // BUG-05 fix: was 40 (MODERATE tier 40-69) but riskLevel is LOW; corrected to 28 (LOW tier 10-39)
    category: 'Gastrointestinal',
    logic: 'ALL',
    conditions: [
      { factKey: 'acid_reflux', operator: 'is_true', value: true, description: 'Acid reflux, heartburn, or indigestion reported' },
    ],
    result: {
      riskLevel: 'LOW',
      advisoryCategory: 'Gastroesophageal Reflux / Dyspepsia',
      recommendedCare: 'SELF_CARE',
      actionSummary: 'Eat smaller, frequent meals, avoid lying recumbent within 3 hours after eating, elevate head of bed 15cm, and limit late-night fatty or acidic foods.',
      clinicalRationale: 'Mild to moderate heartburn and regurgitation without dysphagia, vomiting, or gastrointestinal bleeding responds effectively to behavioral and dietary modifications.',
      guidelineReference: 'ACG Guidelines for the Diagnosis and Management of GERD',
    },
  },

  // ==========================================
  // LOW / SELF-CARE RULES (Priority: 10 - 39)
  // ==========================================
  {
    id: 'R030',
    name: 'Acute Common Upper Respiratory Viral Infection (Common Cold)',
    priority: 35,
    category: 'Respiratory',
    logic: 'ALL',
    conditions: [
      { factKey: 'runny_nose', operator: 'is_true', value: true, description: 'Runny or stuffy nose present' },
      { factKey: 'duration_acute', operator: 'is_true', value: true, description: 'Symptom duration is 3 days or less' },
    ],
    result: {
      riskLevel: 'LOW',
      advisoryCategory: 'Acute Upper Respiratory Infection (Common Cold)',
      recommendedCare: 'SELF_CARE',
      actionSummary: 'Practice supportive home care: get ample bed rest, drink warm fluids, and consider saline nasal irrigation.',
      clinicalRationale: 'Acute coryzal symptoms with acute onset are overwhelmingly viral and self-limiting in the absence of red flags.',
      guidelineReference: 'CDC Upper Respiratory Tract Viral Infection Guidance',
    },
  },
  {
    id: 'R031',
    name: 'Uncomplicated Viral Syndrome / Acute Viral Prodrome',
    priority: 30,
    category: 'Systemic',
    logic: 'ALL',
    conditions: [
      { factKey: 'fever', operator: 'is_true', value: true, description: 'Fever present' },
      { factKey: 'cough', operator: 'is_true', value: true, description: 'Cough present' },
      { factKey: 'duration_acute', operator: 'is_true', value: true, description: 'Symptoms <= 3 days' },
      { factKey: 'severity_mild', operator: 'is_true', value: true, description: 'Mild severity' },
    ],
    result: {
      riskLevel: 'LOW',
      advisoryCategory: 'Mild Acute Viral Syndrome (Flu-like illness)',
      recommendedCare: 'SELF_CARE',
      actionSummary: 'Follow self-care guidance: prioritize rest, hydrate regularly with water and broths, and monitor temperature.',
      clinicalRationale: 'Mild fever and cough of short duration without dyspnea in an otherwise healthy individual is characteristic of mild viral rhinitis or influenza prodrome.',
      guidelineReference: 'WHO Clinical Management of Influenza and Viral Respiratory Infections',
    },
  },
  {
    id: 'R032',
    name: 'Mild Isolated Headache (Tension / Eye Strain)',
    priority: 25,
    category: 'Neurological',
    logic: 'ALL',
    conditions: [
      { factKey: 'headache', operator: 'is_true', value: true, description: 'Headache present' },
      { factKey: 'severity_mild', operator: 'is_true', value: true, description: 'Mild severity' },
      { factKey: 'duration_acute', operator: 'is_true', value: true, description: 'Duration <= 3 days' },
    ],
    result: {
      riskLevel: 'LOW',
      advisoryCategory: 'Mild Tension Headache / Fatigue',
      recommendedCare: 'SELF_CARE',
      actionSummary: 'Rest your eyes, step away from digital screens, drink 500ml of water, and try gentle neck stretches.',
      clinicalRationale: 'Short-duration mild headache without neck stiffness, photophobia, fever, or trauma typically resolves with rest and hydration.',
      guidelineReference: 'NHS Headache Assessment Pathway',
    },
  },
  {
    id: 'R033',
    name: 'Acute Mild Sore Throat (Self-Limiting Pharyngitis)',
    priority: 22,
    category: 'Respiratory',
    logic: 'ALL',
    conditions: [
      { factKey: 'sore_throat', operator: 'is_true', value: true, description: 'Sore throat present' },
      { factKey: 'duration_acute', operator: 'is_true', value: true, description: 'Duration <= 3 days' },
    ],
    result: {
      riskLevel: 'LOW',
      advisoryCategory: 'Mild Viral Pharyngitis',
      recommendedCare: 'SELF_CARE',
      actionSummary: 'Gargle warm salt water, use throat lozenges, and drink warm tea with honey.',
      clinicalRationale: 'Over 85% of acute pharyngitis cases in adults are benign viral illnesses resolving spontaneously within a week.',
      guidelineReference: 'Centor Score Clinical Decision Rule for Sore Throat',
    },
  },
  {
    id: 'R034',
    name: 'Mild Isolated Malaise or Muscle Soreness',
    priority: 18,
    category: 'Systemic',
    logic: 'ALL',
    conditions: [
      { factKey: 'fatigue', operator: 'is_true', value: true, description: 'Fatigue or tiredness present' },
      { factKey: 'severity_mild', operator: 'is_true', value: true, description: 'Mild severity' },
    ],
    result: {
      riskLevel: 'LOW',
      advisoryCategory: 'Mild Transient Fatigue / Exertion Malaise',
      recommendedCare: 'SELF_CARE',
      actionSummary: 'Ensure 7-9 hours of restful sleep, maintain balanced nutrition, and reduce strenuous physical workloads.',
      clinicalRationale: 'Isolated mild fatigue without persistent fever, significant weight loss, or functional impairment represents benign transient fatigue.',
      guidelineReference: 'RACGP Fatigue Investigation and Management Guidelines',
    },
  },

  // ==========================================
  // FALLBACK GENERAL ADVISORY (Priority: 5)
  // ==========================================
  {
    id: 'R040',
    name: 'Non-Specific Symptom Cluster Consultation Rule',
    priority: 5,
    category: 'Systemic',
    logic: 'ALL',
    conditions: [],
    result: {
      riskLevel: 'MODERATE',
      advisoryCategory: 'General Clinical Review Required',
      recommendedCare: 'PRIMARY_CARE',
      actionSummary: 'Schedule an appointment with a licensed healthcare practitioner for a personalized examination.',
      clinicalRationale: 'The entered symptom profile does not definitively trigger self-care or acute emergency flags. Clinical history taking and physical examination are recommended.',
      guidelineReference: 'General Medical Council Standards for Clinical Decision Support',
    },
  },
];
