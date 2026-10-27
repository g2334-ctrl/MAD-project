require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('./models/Patient');
const Driver = require('./models/Driver');
const Hospital = require('./models/Hospital');
const Emergency = require('./models/Emergency');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_ambulance';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB for seeding');

  // Clear existing data
  await Patient.deleteMany({});
  await Driver.deleteMany({});
  await Hospital.deleteMany({});
  await Emergency.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // 1. Create Hospitals
  const hospital1 = await Hospital.create({
    name: 'City Emergency Hospital',
    hospitalId: 'HOSP-CE-108',
    password: 'hospital123',
    address: '123 Medical Avenue, Gandhipuram',
    city: 'Coimbatore',
    pincode: '641001',
    phone: '0422-2345678',
    email: 'admin@cityemergency.in',
    adminName: 'Dr. Priya Sharma (Trauma Lead)',
    coords: { lat: 11.0025, lng: 76.9615 },
    totalBeds: 200,
    availableBeds: 45,
    departments: ['Emergency', 'Trauma', 'Cardiac', 'Pediatric', 'General Surgery', 'Neurology'],
    icuAvailable: 8
  });

  const hospital2 = await Hospital.create({
    name: 'Kovai Medical Center & Trauma Care',
    hospitalId: 'HOSP-KM-202',
    password: 'hospital123',
    address: '88 Avinashi Road, Peelamedu',
    city: 'Coimbatore',
    pincode: '641004',
    phone: '0422-4567890',
    email: 'er@kovaimedical.in',
    adminName: 'Dr. Rajesh Nathan (Emergency Chief)',
    coords: { lat: 11.0280, lng: 77.0010 },
    totalBeds: 350,
    availableBeds: 82,
    departments: ['Emergency', 'Trauma', 'Cardiac ICU', 'Burn Unit', 'Orthopedics'],
    icuAvailable: 15
  });

  const hospital3 = await Hospital.create({
    name: 'Coimbatore Govt Medical College Hospital',
    hospitalId: 'HOSP-GH-303',
    password: 'hospital123',
    address: 'Trichy Road, Coimbatore Central',
    city: 'Coimbatore',
    pincode: '641018',
    phone: '0422-2300000',
    email: 'cmch@tn.gov.in',
    adminName: 'Dr. Anand Kumar (ER Superintendent)',
    coords: { lat: 10.9980, lng: 76.9720 },
    totalBeds: 500,
    availableBeds: 120,
    departments: ['Emergency', 'Trauma Triage', 'ICU', 'Poison Care', 'Pediatrics'],
    icuAvailable: 22
  });

  const hospital4 = await Hospital.create({
    name: 'PSG Specialty Hospital',
    hospitalId: 'HOSP-PS-404',
    password: 'hospital123',
    address: 'Peelamedu Main Rd, Coimbatore',
    city: 'Coimbatore',
    pincode: '641004',
    phone: '0422-2570170',
    email: 'trauma@psghospitals.com',
    adminName: 'Dr. Meenakshi S (Chief Medical Officer)',
    coords: { lat: 11.0240, lng: 76.9940 },
    totalBeds: 280,
    availableBeds: 58,
    departments: ['Emergency', 'Cardiac Care', 'Neuro ICU', 'Trauma & Ortho'],
    icuAvailable: 11
  });

  console.log('🏥 4 Hospitals created successfully');

  // 2. Create Ambulance Drivers
  const driver1 = await Driver.create({
    name: 'Ravi Kumar',
    mobile: '9445512233',
    email: 'ravi.driver@ambulance.in',
    password: 'driver123',
    altMobile: '9445512234',
    currentLocation: 'Gandhipuram Signal, Coimbatore',
    nativePlace: 'Coimbatore',
    ambulanceNumber: 'TN-45-AB-1080',
    assignedHospital: hospital1._id,
    isAvailable: true,
    coords: { lat: 11.0096, lng: 76.9707 },
    shiftStartTime: new Date(),
    totalTripsToday: 2,
    fatigueFlag: false,
    fleetType: 'hospital-owned'
  });

  const driver2 = await Driver.create({
    name: 'Karthik Raja',
    mobile: '9445512244',
    email: 'karthik.driver@ambulance.in',
    password: 'driver123',
    altMobile: '9445512245',
    currentLocation: 'RS Puram East, Coimbatore',
    nativePlace: 'Coimbatore',
    ambulanceNumber: 'TN-38-EM-2020',
    assignedHospital: hospital2._id,
    isAvailable: true,
    coords: { lat: 11.0190, lng: 76.9630 },
    shiftStartTime: new Date(),
    totalTripsToday: 1,
    fatigueFlag: false,
    fleetType: 'private'
  });

  const driver3 = await Driver.create({
    name: 'Selvam Murugan',
    mobile: '9445512255',
    email: 'selvam.driver@ambulance.in',
    password: 'driver123',
    altMobile: '9445512256',
    currentLocation: 'Avinashi Rd Flyover, Coimbatore',
    nativePlace: 'Coimbatore',
    ambulanceNumber: 'TN-37-AM-108',
    assignedHospital: hospital4._id,
    isAvailable: true,
    coords: { lat: 11.0150, lng: 76.9850 },
    shiftStartTime: new Date(),
    totalTripsToday: 3,
    fatigueFlag: false,
    fleetType: 'hospital-owned'
  });

  const driver4 = await Driver.create({
    name: 'Manoj Sundaram',
    mobile: '9445512266',
    email: 'manoj.driver@ambulance.in',
    password: 'driver123',
    altMobile: '9445512267',
    currentLocation: 'Town Hall / Ukkadam, Coimbatore',
    nativePlace: 'Coimbatore',
    ambulanceNumber: 'TN-66-ER-999',
    assignedHospital: hospital3._id,
    isAvailable: true,
    coords: { lat: 10.9930, lng: 76.9600 },
    shiftStartTime: new Date(),
    totalTripsToday: 0,
    fatigueFlag: false,
    fleetType: 'hospital-owned'
  });

  console.log('🚑 4 Ambulance Units created successfully');

  // 3. Create Patient
  const patient = await Patient.create({
    name: 'Ananya Krishnan',
    mobile: '9876543210',
    email: 'ananya@patient.in',
    password: 'patient123',
    altMobile: '9876543211',
    currentLocation: 'Diwan Bahadur Rd, RS Puram, Coimbatore',
    nativePlace: 'Coimbatore',
    coords: { lat: 11.0168, lng: 76.9558 },
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Asthma (mild)'],
    emergencyContacts: [
      { name: 'Suresh Krishnan (Father)', mobile: '9876543200' },
      { name: 'Meena Krishnan (Mother)', mobile: '9876543201' }
    ],
    preferredLanguage: 'en'
  });

  console.log(`👤 Patient created: ${patient.name} (${patient.mobile})`);

  console.log('\n✅ Seed data complete!');
  console.log('─────────────────────────────────────────');
  console.log('Login credentials:');
  console.log('  Patient   → mobile: 9876543210   password: patient123');
  console.log('  Driver 1  → mobile: 9445512233   password: driver123  (Ravi Kumar - TN-45-AB-1080)');
  console.log('  Driver 2  → mobile: 9445512244   password: driver123  (Karthik Raja - TN-38-EM-2020)');
  console.log('  Driver 3  → mobile: 9445512255   password: driver123  (Selvam M - TN-37-AM-108)');
  console.log('  Driver 4  → mobile: 9445512266   password: driver123  (Manoj S - TN-66-ER-999)');
  console.log('  Hospital 1→ ID: HOSP-CE-108      password: hospital123 (City Emergency Hospital)');
  console.log('  Hospital 2→ ID: HOSP-KM-202      password: hospital123 (Kovai Medical Center)');
  console.log('  Hospital 3→ ID: HOSP-GH-303      password: hospital123 (Govt Medical College)');
  console.log('  Hospital 4→ ID: HOSP-PS-404      password: hospital123 (PSG Specialty)');
  console.log('─────────────────────────────────────────');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
