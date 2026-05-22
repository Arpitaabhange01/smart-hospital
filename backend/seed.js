require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const MedicalReport = require('./models/MedicalReport');
const Invoice = require('./models/Invoice');
const Notification = require('./models/Notification');
const PharmacyMedicine = require('./models/PharmacyMedicine');
const Ward = require('./models/Ward');
const IPDAdmission = require('./models/IPDAdmission');
const AuditLog = require('./models/AuditLog');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

const hash = async (pw) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(pw, salt);
};

async function seed() {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Appointment.deleteMany({}),
    Prescription.deleteMany({}),
    MedicalReport.deleteMany({}),
    Invoice.deleteMany({}),
    Notification.deleteMany({}),
    PharmacyMedicine.deleteMany({}),
    Ward.deleteMany({}),
    IPDAdmission.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // ─── 1. Create Users ────────────────────────────────────
  const password = 'test123';

  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@hospital.com',
    password,
    phone: '9876543210',
    role: 'admin',
    isVerified: true,
    gender: 'male',
  });
  console.log(`Admin created: admin@hospital.com / ${password}`);

  const receptionist = await User.create({
    name: 'Priya Sharma',
    email: 'reception@hospital.com',
    password,
    phone: '9876543211',
    role: 'receptionist',
    isVerified: true,
    gender: 'female',
  });
  console.log(`Receptionist created: reception@hospital.com / ${password}`);

  const patient = await User.create({
    name: 'Rahul Verma',
    email: 'patient@test.com',
    password,
    phone: '9876543212',
    role: 'patient',
    isVerified: true,
    gender: 'male',
    dateOfBirth: new Date('1990-05-15'),
    address: { street: '123 Main St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  });
  console.log(`Patient created: patient@test.com / ${password}`);

  const patient2 = await User.create({
    name: 'Sneha Patel',
    email: 'sneha@test.com',
    password,
    phone: '9876543213',
    role: 'patient',
    isVerified: true,
    gender: 'female',
    dateOfBirth: new Date('1995-08-22'),
    address: { street: '456 Park Ave', city: 'Delhi', state: 'Delhi', pincode: '110001' },
  });

  // ─── 2. Create Doctor Profiles ──────────────────────────
  const doc1User = await User.create({
    name: 'Amit Kumar',
    email: 'doctor1@hospital.com',
    password,
    phone: '9876543220',
    role: 'doctor',
    isVerified: true,
    gender: 'male',
  });

  const doc1 = await Doctor.create({
    user: doc1User._id,
    specialization: 'Cardiologist',
    department: 'Cardiology',
    experience: 12,
    fees: 800,
    about: 'Senior cardiologist with expertise in interventional cardiology.',
    availability: [
      { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
      { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
      { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM'] },
    ],
  });

  const doc2User = await User.create({
    name: 'Neha Gupta',
    email: 'doctor2@hospital.com',
    password,
    phone: '9876543221',
    role: 'doctor',
    isVerified: true,
    gender: 'female',
  });

  const doc2 = await Doctor.create({
    user: doc2User._id,
    specialization: 'Neurologist',
    department: 'Neurology',
    experience: 8,
    fees: 1000,
    about: 'Specialist in neurological disorders and stroke management.',
    availability: [
      { day: 'Tuesday', slots: ['10:00 AM', '11:00 AM', '12:00 PM', '03:00 PM', '04:00 PM'] },
      { day: 'Thursday', slots: ['10:00 AM', '11:00 AM', '12:00 PM', '03:00 PM', '04:00 PM'] },
      { day: 'Saturday', slots: ['10:00 AM', '12:00 PM'] },
    ],
  });

  const doc3User = await User.create({
    name: 'Vikram Singh',
    email: 'doctor3@hospital.com',
    password,
    phone: '9876543222',
    role: 'doctor',
    isVerified: true,
    gender: 'male',
  });

  const doc3 = await Doctor.create({
    user: doc3User._id,
    specialization: 'Orthopedic Surgeon',
    department: 'Orthopedics',
    experience: 15,
    fees: 1200,
    about: 'Experienced orthopedic surgeon specializing in joint replacements.',
    availability: [
      { day: 'Monday', slots: ['11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'] },
      { day: 'Wednesday', slots: ['11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'] },
      { day: 'Friday', slots: ['11:00 AM', '02:00 PM', '04:00 PM'] },
    ],
  });

  const doc4User = await User.create({
    name: 'Ananya Desai',
    email: 'doctor4@hospital.com',
    password,
    phone: '9876543223',
    role: 'doctor',
    isVerified: true,
    gender: 'female',
  });

  const doc4 = await Doctor.create({
    user: doc4User._id,
    specialization: 'Dermatologist',
    department: 'Dermatology',
    experience: 6,
    fees: 600,
    about: 'Skin care specialist with focus on cosmetic dermatology.',
    availability: [
      { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'] },
      { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'] },
      { day: 'Saturday', slots: ['09:00 AM', '11:00 AM'] },
    ],
  });

  console.log('4 doctors created');

  // ─── 3. Create Appointments ─────────────────────────────
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today); dayAfter.setDate(dayAfter.getDate() + 2);
  const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
  const lastWeek = new Date(today); lastWeek.setDate(lastWeek.getDate() - 5);

  const app1 = await Appointment.create({
    patient: patient._id,
    doctor: doc1User._id,
    doctorProfile: doc1._id,
    date: tomorrow,
    timeSlot: '10:00 AM',
    status: 'confirmed',
    reason: 'Chest pain and shortness of breath',
  });

  const app2 = await Appointment.create({
    patient: patient._id,
    doctor: doc2User._id,
    doctorProfile: doc2._id,
    date: dayAfter,
    timeSlot: '11:00 AM',
    status: 'pending',
    reason: 'Recurring headaches',
  });

  const app3 = await Appointment.create({
    patient: patient2._id,
    doctor: doc3User._id,
    doctorProfile: doc3._id,
    date: nextWeek,
    timeSlot: '02:00 PM',
    status: 'confirmed',
    reason: 'Knee pain after running',
  });

  const app4 = await Appointment.create({
    patient: patient._id,
    doctor: doc4User._id,
    doctorProfile: doc4._id,
    date: lastWeek,
    timeSlot: '10:00 AM',
    status: 'completed',
    reason: 'Skin rash checkup',
  });

  const app5 = await Appointment.create({
    patient: patient2._id,
    doctor: doc1User._id,
    doctorProfile: doc1._id,
    date: lastWeek,
    timeSlot: '09:00 AM',
    status: 'completed',
    reason: 'Regular heart checkup',
  });

  console.log('5 appointments created');

  // ─── 4. Create Prescriptions ────────────────────────────
  const presc1 = await Prescription.create({
    patient: patient._id,
    doctor: doc4User._id,
    appointment: app4._id,
    diagnosis: 'Contact dermatitis caused by new skincare product',
    medicines: [
      { name: 'Hydrocortisone Cream', dosage: '1%', frequency: 'Twice daily', duration: '7 days', notes: 'Apply on affected area' },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '5 days', notes: 'Take at bedtime' },
    ],
    notes: 'Avoid the triggering product. Use mild soap for bathing.',
  });

  const presc2 = await Prescription.create({
    patient: patient2._id,
    doctor: doc1User._id,
    appointment: app5._id,
    diagnosis: 'Mild hypertension — Stage 1',
    medicines: [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days', notes: 'Take in the morning' },
      { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '30 days', notes: 'After breakfast' },
    ],
    notes: 'Monitor BP daily. Follow up in 2 weeks. Reduce salt intake.',
  });

  console.log('2 prescriptions created');

  // ─── 5. Create Medical Reports ───────────────────────────
  const report1 = await MedicalReport.create({
    patient: patient._id,
    doctor: doc1User._id,
    title: 'Blood Test Report - May 2026',
    description: 'Complete blood count and lipid profile',
    reportType: 'blood-test',
    fileUrl: '',
  });

  const report2 = await MedicalReport.create({
    patient: patient._id,
    doctor: doc1User._id,
    title: 'ECG Report - May 2026',
    description: 'Electrocardiogram reading shows normal sinus rhythm',
    reportType: 'general',
    fileUrl: '',
  });

  const report3 = await MedicalReport.create({
    patient: patient2._id,
    doctor: doc3User._id,
    title: 'X-Ray - Right Knee',
    description: 'Anterior-posterior and lateral views',
    reportType: 'x-ray',
    fileUrl: '',
  });

  console.log('3 medical reports created');
  // ─── 6. Create Invoices ────────────────────────────────
  const inv1 = await Invoice.create({
    patient: patient._id,
    appointment: app4._id,
    items: [
      { description: 'Consultation Fee - Dermatology', amount: 600 },
      { description: 'Skin Allergy Test', amount: 400 },
    ],
    subtotal: 1000,
    tax: 0,
    total: 1000,
    status: 'paid',
    paymentMethod: 'Razorpay',
    paidAt: new Date(),
  });

  const inv2 = await Invoice.create({
    patient: patient._id,
    items: [
      { description: 'Consultation Fee - Cardiology', amount: 800 },
      { description: 'ECG Test', amount: 500 },
      { description: 'Blood Test - Lipid Profile', amount: 300 },
    ],
    subtotal: 1600,
    tax: 0,
    total: 1600,
    status: 'pending',
  });

  const inv3 = await Invoice.create({
    patient: patient2._id,
    appointment: app5._id,
    items: [
      { description: 'Consultation Fee - Cardiology', amount: 800 },
      { description: 'BP Monitoring', amount: 200 },
    ],
    subtotal: 1000,
    tax: 0,
    total: 1000,
    status: 'paid',
    paymentMethod: 'Cash',
    paidAt: new Date(),
  });

  console.log('3 invoices created');

  // ─── 7. Create Notifications ────────────────────────────
  await Notification.create({
    user: patient._id,
    type: 'payment',
    title: 'Invoice Generated',
    message: 'Invoice INV-0002 for ₹1,600 has been generated and is pending payment.',
    link: '/patient/billing',
    isRead: false,
  });
  await Notification.create({
    user: patient._id,
    type: 'prescription',
    title: 'New Prescription',
    message: 'Dr. Ananya Desai has issued a new prescription for you.',
    link: '/patient/my-prescriptions',
    isRead: true,
  });

  console.log('3 notifications created');

  // ─── 8. Create Pharmacy Medicines ──────────────────────
  await PharmacyMedicine.create([
    { name: 'Paracetamol', genericName: 'Acetaminophen', category: 'Tablet', strength: '500mg', manufacturer: 'Cipla', price: 30, stock: 200, minStock: 50, unit: 'strip', requiresPrescription: false },
    { name: 'Amoxicillin', genericName: 'Amoxicillin', category: 'Capsule', strength: '250mg', manufacturer: 'Sun Pharma', price: 85, stock: 150, minStock: 30, unit: 'strip', requiresPrescription: true },
    { name: 'Cetirizine', genericName: 'Cetirizine HCl', category: 'Tablet', strength: '10mg', manufacturer: 'Dr. Reddy\'s', price: 25, stock: 180, minStock: 40, unit: 'strip', requiresPrescription: false },
    { name: 'Amlodipine', genericName: 'Amlodipine Besylate', category: 'Tablet', strength: '5mg', manufacturer: 'Pfizer', price: 45, stock: 120, minStock: 25, unit: 'strip', requiresPrescription: true },
    { name: 'Omeprazole', genericName: 'Omeprazole', category: 'Capsule', strength: '20mg', manufacturer: 'GSK', price: 55, stock: 3, minStock: 20, unit: 'strip', requiresPrescription: false },
    { name: 'Salbutamol Inhaler', genericName: 'Albuterol', category: 'Inhaler', strength: '100mcg', manufacturer: 'Cipla', price: 180, stock: 40, minStock: 10, unit: 'unit', requiresPrescription: true },
    { name: 'Hydrocortisone Cream', genericName: 'Hydrocortisone', category: 'Cream', strength: '1%', manufacturer: 'Abbott', price: 65, stock: 60, minStock: 15, unit: 'tube', requiresPrescription: false },
    { name: 'Insulin Glargine', genericName: 'Insulin Glargine', category: 'Injection', strength: '100IU/mL', manufacturer: 'Sanofi', price: 450, stock: 25, minStock: 10, unit: 'vial', requiresPrescription: true },
  ]);
  console.log('8 pharmacy medicines created');

  // ─── 9. Create Wards ──────────────────────────────────
  const ward1 = await Ward.create({ name: 'General Ward A', type: 'General', totalBeds: 30, availableBeds: 22, pricePerDay: 500, floor: '2', description: 'General medicine ward with 30 beds.' });
  const ward2 = await Ward.create({ name: 'ICU Blue', type: 'ICU', totalBeds: 10, availableBeds: 3, pricePerDay: 3000, floor: '4', description: 'Intensive Care Unit with full monitoring.' });
  const ward3 = await Ward.create({ name: 'Private Suite 1', type: 'Private', totalBeds: 5, availableBeds: 4, pricePerDay: 2500, floor: '6', description: 'Private rooms with attached bathroom and TV.' });
  const ward4 = await Ward.create({ name: 'NICU', type: 'NICU', totalBeds: 8, availableBeds: 6, pricePerDay: 2000, floor: '5', description: 'Neonatal Intensive Care Unit.' });
  console.log('4 wards created');

  // ─── 10. Create IPD Admission ─────────────────────────
  await IPDAdmission.create({
    patient: patient._id,
    doctor: doc1User._id,
    ward: ward2._id,
    bedNumber: 'ICU-001',
    admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    diagnosis: 'Acute myocardial infarction, under observation.',
    status: 'admitted',
    admittedBy: doc1User._id,
  });
  console.log('1 IPD admission created');

  // ─── 11. Create Audit Logs ────────────────────────────
  await AuditLog.create([
    { user: admin._id, action: 'login', resource: 'Auth', details: { method: 'email' }, ip: '127.0.0.1' },
    { user: admin._id, action: 'create', resource: 'User', resourceId: doc1User._id.toString(), details: { role: 'doctor' }, ip: '127.0.0.1' },
    { user: patient._id, action: 'create', resource: 'Appointment', resourceId: app1._id.toString(), details: { doctor: 'Dr. Amit Kumar' }, ip: '127.0.0.1' },
  ]);
  console.log('3 audit logs created');

  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ DATABASE SEEDED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════');
  console.log('\n📋 Login Credentials:');
  console.log('───────────────────────────────────────────');
  console.log('  Admin:         admin@hospital.com / test123');
  console.log('  Receptionist:  reception@hospital.com / test123');
  console.log('  Doctor (Cardio):   doctor1@hospital.com / test123');
  console.log('  Doctor (Neuro):    doctor2@hospital.com / test123');
  console.log('  Doctor (Ortho):    doctor3@hospital.com / test123');
  console.log('  Doctor (Derma):    doctor4@hospital.com / test123');
  console.log('  Patient:       patient@test.com / test123');
  console.log('  Patient:       sneha@test.com / test123');
  console.log('───────────────────────────────────────────\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
