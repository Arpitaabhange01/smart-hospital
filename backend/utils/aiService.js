const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

let geminiModel = null;
if (AI_PROVIDER === 'gemini' && GEMINI_API_KEY) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
  } catch (e) {
    console.warn('Failed to initialize Gemini:', e.message);
  }
}

async function callGemini(prompt) {
  if (!geminiModel) throw new Error('Gemini not configured');
  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function callOpenAI(prompt) {
  if (!OPENAI_API_KEY) throw new Error('OpenAI not configured');
  const fetch = (await import('node-fetch')).default;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callAI(prompt) {
  if (AI_PROVIDER === 'gemini' && GEMINI_API_KEY) return callGemini(prompt);
  if (AI_PROVIDER === 'openai' && OPENAI_API_KEY) return callOpenAI(prompt);
  throw new Error('No AI provider configured');
}

const symptomsDB = {
  fever: { conditions: ['Common Cold', 'Flu', 'COVID-19', 'Infection'], department: 'General Medicine' },
  headache: { conditions: ['Migraine', 'Tension Headache', 'Sinusitis', 'Cluster Headache'], department: 'Neurology' },
  cough: { conditions: ['Common Cold', 'Bronchitis', 'Pneumonia', 'Asthma'], department: 'Pulmonology' },
  'sore throat': { conditions: ['Tonsillitis', 'Pharyngitis', 'Common Cold', 'Strep Throat'], department: 'ENT' },
  'chest pain': { conditions: ['Costochondritis', 'GERD', 'Angina', 'Anxiety'], department: 'Cardiology' },
  'back pain': { conditions: ['Muscle Strain', 'Herniated Disc', 'Sciatica', 'Scoliosis'], department: 'Orthopedics' },
  'joint pain': { conditions: ['Arthritis', 'Gout', 'Bursitis', 'Tendonitis'], department: 'Rheumatology' },
  'skin rash': { conditions: ['Eczema', 'Psoriasis', 'Allergic Reaction', 'Contact Dermatitis'], department: 'Dermatology' },
  nausea: { conditions: ['Food Poisoning', 'Gastritis', 'Migraine', 'GERD'], department: 'Gastroenterology' },
  dizziness: { conditions: ['Vertigo', 'Anemia', 'Low Blood Pressure', 'Inner Ear Infection'], department: 'Neurology' },
  fatigue: { conditions: ['Anemia', 'Thyroid Disorders', 'Sleep Apnea', 'Chronic Fatigue'], department: 'General Medicine' },
  'shortness of breath': { conditions: ['Asthma', 'COPD', 'Pneumonia', 'Anxiety'], department: 'Pulmonology' },
  'abdominal pain': { conditions: ['Appendicitis', 'Gas', 'IBS', 'Kidney Stones'], department: 'Gastroenterology' },
  'blurred vision': { conditions: ['Refractive Error', 'Cataracts', 'Diabetes', 'Glaucoma'], department: 'Ophthalmology' },
};

const symptomCheckerFallback = (symptoms) => {
  const input = symptoms.toLowerCase();
  const matched = Object.entries(symptomsDB).filter(([key]) => input.includes(key));
  if (matched.length === 0) {
    return {
      possibleConditions: ['General Checkup Recommended'],
      recommendedDepartment: 'General Medicine',
      disclaimer: 'Based on limited symptom data. Please consult a doctor.',
    };
  }
  const conditions = [...new Set(matched.flatMap(([, v]) => v.conditions))].slice(0, 5);
  const departments = [...new Set(matched.map(([, v]) => v.department))];
  return {
    possibleConditions: conditions,
    recommendedDepartment: departments.join(', '),
    disclaimer: 'This is an AI-assisted analysis. Please consult a doctor for accurate diagnosis.',
  };
};

exports.symptomChecker = async (symptoms) => {
  if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
    return symptomCheckerFallback(symptoms);
  }
  const prompt = `You are a medical AI assistant. Based on the following symptoms, list 3-5 possible conditions and recommend a hospital department. Format your response as JSON with keys: "possibleConditions" (array of strings), "recommendedDepartment" (string), "disclaimer" (string). Only respond with valid JSON, no markdown.

Symptoms: "${symptoms}"`;
  try {
    const text = await callAI(prompt);
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return symptomCheckerFallback(symptoms);
  }
};

exports.summarizeReport = async (reportText) => {
  if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
    return {
      summary: 'AI summary not available. Please configure an AI provider (Gemini or OpenAI).',
      keyFindings: ['No AI provider configured'],
      recommendation: 'Set GEMINI_API_KEY or OPENAI_API_KEY in .env file.',
    };
  }
  const prompt = `You are a medical AI assistant. Summarize the following medical report in simple, easy-to-understand language for a patient. Format your response as JSON with keys: "summary" (string, 2-3 sentences), "keyFindings" (array of strings, 2-4 bullet points), "recommendation" (string, 1-2 sentences). Only respond with valid JSON, no markdown.

Medical Report:
"${reportText}"`;
  try {
    const text = await callAI(prompt);
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      summary: 'Could not process the report. Please try again.',
      keyFindings: ['Processing error'],
      recommendation: 'Please re-upload or contact support.',
    };
  }
};

const chatbotFallback = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes('appointment') || msg.includes('book')) {
    return 'You can book an appointment by going to the "Book Appointment" section in your dashboard. Select a doctor, choose a date and time slot, and confirm.';
  }
  if (msg.includes('report') || msg.includes('test')) {
    return 'Your medical reports are available in the "Medical Reports" section of your dashboard. You can view and download them there.';
  }
  if (msg.includes('prescription') || msg.includes('medicine')) {
    return 'All your prescriptions are listed in the "Prescriptions" section. You can view medicine details, dosage, and duration there.';
  }
  if (msg.includes('symptom') || msg.includes('pain') || msg.includes('feel')) {
    return 'Try our AI Symptom Checker tool! It can help identify possible conditions based on your symptoms. You can find it in the sidebar.';
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return 'Hello! I am Smart Health Assistant. I can help you with appointments, reports, prescriptions, and general health questions. How can I assist you today?';
  }
  if (msg.includes('thank')) {
    return "You're welcome! Is there anything else I can help you with?";
  }
  return 'I am here to help with general health queries, appointment booking, and navigating the hospital system. For specific medical concerns, please consult a doctor.';
};

exports.chatbot = async (message) => {
  if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
    return { reply: chatbotFallback(message) };
  }
  const prompt = `You are a friendly and professional AI health assistant for Smart Hospital. Answer the following patient query in a helpful, concise way (2-4 sentences). Do NOT provide medical diagnoses — always recommend consulting a doctor for medical concerns. Keep responses warm and supportive.

Patient: "${message}"
Assistant:`;
  try {
    const text = await callAI(prompt);
    return { reply: text.replace(/^["']|["']$/g, '').trim() };
  } catch {
    return { reply: chatbotFallback(message) };
  }
};
