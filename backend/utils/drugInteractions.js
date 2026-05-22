const interactions = [
  { drugs: ['Warfarin', 'Aspirin'], severity: 'high', effect: 'Increased risk of bleeding. Monitor INR closely.' },
  { drugs: ['Warfarin', 'Amoxicillin'], severity: 'moderate', effect: 'May potentiate warfarin effect. Monitor INR.' },
  { drugs: ['Warfarin', 'Amiodarone'], severity: 'high', effect: 'Significantly increases INR. Reduce warfarin dose.' },
  { drugs: ['Aspirin', 'Ibuprofen'], severity: 'moderate', effect: 'Increased risk of GI bleeding.' },
  { drugs: ['Aspirin', 'Clopidogrel'], severity: 'high', effect: 'Significantly increased bleeding risk.' },
  { drugs: ['Metformin', 'Insulin'], severity: 'moderate', effect: 'Increased risk of hypoglycemia. Monitor blood sugar.' },
  { drugs: ['Metformin', 'Furosemide'], severity: 'moderate', effect: 'May increase metformin levels. Monitor renal function.' },
  { drugs: ['Simvastatin', 'Amiodarone'], severity: 'high', effect: 'Increased risk of rhabdomyolysis. Avoid combination.' },
  { drugs: ['Simvastatin', 'Clarithromycin'], severity: 'high', effect: 'Increased risk of myopathy. Avoid or use lower dose.' },
  { drugs: ['Simvastatin', 'Fluconazole'], severity: 'high', effect: 'Increased statin levels. Risk of myopathy.' },
  { drugs: ['Amlodipine', 'Simvastatin'], severity: 'moderate', effect: 'Increased simvastatin levels. Limit simvastatin to 20mg.' },
  { drugs: ['Amlodipine', 'Clarithromycin'], severity: 'moderate', effect: 'Increased amlodipine levels. Monitor BP.' },
  { drugs: ['Digoxin', 'Amiodarone'], severity: 'high', effect: 'Increased digoxin levels. Reduce digoxin dose by 50%.' },
  { drugs: ['Digoxin', 'Furosemide'], severity: 'moderate', effect: 'Hypokalemia increases digoxin toxicity. Monitor K+.' },
  { drugs: ['ACE Inhibitors', 'Spironolactone'], severity: 'high', effect: 'Risk of hyperkalemia. Monitor potassium levels.' },
  { drugs: ['ACE Inhibitors', 'Ibuprofen'], severity: 'moderate', effect: 'Reduced antihypertensive effect. Risk of renal impairment.' },
  { drugs: ['Losartan', 'Ibuprofen'], severity: 'moderate', effect: 'Reduced antihypertensive effect.' },
  { drugs: ['SSRI', 'MAOI'], severity: 'high', effect: 'Risk of serotonin syndrome. Avoid combination.' },
  { drugs: ['SSRI', 'Tramadol'], severity: 'moderate', effect: 'Increased risk of serotonin syndrome.' },
  { drugs: ['SSRI', 'Sumatriptan'], severity: 'moderate', effect: 'Risk of serotonin syndrome.' },
  { drugs: ['Theophylline', 'Ciprofloxacin'], severity: 'high', effect: 'Increased theophylline levels. Reduce dose.' },
  { drugs: ['Theophylline', 'Fluconazole'], severity: 'moderate', effect: 'Increased theophylline levels.' },
  { drugs: ['Lithium', 'Ibuprofen'], severity: 'high', effect: 'Increased lithium levels. Risk of toxicity.' },
  { drugs: ['Lithium', 'Furosemide'], severity: 'high', effect: 'Increased lithium levels. Risk of toxicity.' },
  { drugs: ['Methotrexate', 'Aspirin'], severity: 'moderate', effect: 'Increased methotrexate levels.' },
  { drugs: ['Methotrexate', 'Penicillin'], severity: 'moderate', effect: 'Reduced methotrexate clearance.' },
  { drugs: ['Paracetamol', 'Warfarin'], severity: 'moderate', effect: 'Increased INR with high doses of paracetamol.' },
  { drugs: ['Omeprazole', 'Clopidogrel'], severity: 'moderate', effect: 'Reduced clopidogrel effectiveness.' },
  { drugs: ['Omeprazole', 'Methotrexate'], severity: 'moderate', effect: 'Increased methotrexate levels.' },
];

const severityColors = {
  high: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', label: 'HIGH' },
  moderate: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', label: 'MODERATE' },
};

function findInteractions(newMedicineName, existingMedicineNames) {
  const results = [];
  for (const interaction of interactions) {
    const matchNew = interaction.drugs.some((d) =>
      newMedicineName.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(newMedicineName.toLowerCase())
    );
    if (!matchNew) continue;
    const matchExisting = interaction.drugs.some((d) =>
      existingMedicineNames.some((existing) => existing.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(existing.toLowerCase()))
    );
    if (matchExisting) {
      results.push(interaction);
    }
  }
  return results;
}

function checkAllInteractions(medicineNames) {
  const results = [];
  for (let i = 0; i < medicineNames.length; i++) {
    for (let j = i + 1; j < medicineNames.length; j++) {
      for (const interaction of interactions) {
        const matchA = interaction.drugs.some((d) =>
          medicineNames[i].toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(medicineNames[i].toLowerCase())
        );
        const matchB = interaction.drugs.some((d) =>
          medicineNames[j].toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(medicineNames[j].toLowerCase())
        );
        if (matchA && matchB) {
          results.push({ ...interaction, between: [medicineNames[i], medicineNames[j]] });
        }
      }
    }
  }
  return results;
}

if (typeof window !== 'undefined') {
  window.__drugInteractions = interactions;
  window.__checkInteractions = checkAllInteractions;
}

module.exports = { interactions, findInteractions, checkAllInteractions, severityColors };
