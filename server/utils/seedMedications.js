const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Medication = require('../models/medicationModel');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Sample medications data
const medications = [  {
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    category: 'Analgesic',
    dosageForm: 'tablet',
    strength: '500mg',
    manufacturer: 'PharmaCorp Ltd',
    currentStock: 150,
    reorderLevel: 50,
    expiryDate: new Date('2025-12-31'),
    batchNumber: 'PCM2024001',
    unitPrice: 2.50,
    location: 'Shelf A1',
    prescriptionRequired: false
  },
  {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    category: 'Antibiotic',
    dosageForm: 'capsule',
    strength: '250mg',
    manufacturer: 'MediCare Pharma',
    currentStock: 75,
    reorderLevel: 30,
    expiryDate: new Date('2025-08-15'),
    batchNumber: 'AMX2024002',
    unitPrice: 12.00,
    location: 'Refrigerator B2',
    prescriptionRequired: true
  },
  {
    name: 'Insulin Injection',
    genericName: 'Human Insulin',
    category: 'Antidiabetic',
    dosageForm: 'injection',
    strength: '100IU/ml',
    manufacturer: 'DiaCare Solutions',
    currentStock: 25,
    reorderLevel: 20,
    expiryDate: new Date('2025-06-30'),
    batchNumber: 'INS2024003',
    unitPrice: 450.00,
    location: 'Refrigerator C1',
    prescriptionRequired: true
  },
  {
    name: 'Cough Syrup',
    genericName: 'Dextromethorphan',
    category: 'Antitussive',
    dosageForm: 'syrup',
    strength: '15mg/5ml',
    manufacturer: 'RespiCare Pharma',
    currentStock: 40,
    reorderLevel: 15,
    expiryDate: new Date('2025-10-20'),
    batchNumber: 'CSY2024004',
    unitPrice: 85.00,
    location: 'Shelf D3',
    prescriptionRequired: false
  },
  {
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    category: 'Analgesic',
    dosageForm: 'tablet',
    strength: '100mg',
    manufacturer: 'CardioMed Inc',
    currentStock: 5, // Low stock example
    reorderLevel: 25,
    expiryDate: new Date('2024-03-15'), // Expired example
    batchNumber: 'ASP2023005',
    unitPrice: 3.75,
    location: 'Shelf A2',
    prescriptionRequired: false
  },
  {
    name: 'Antiseptic Cream',
    genericName: 'Chlorhexidine',
    category: 'Antiseptic',
    dosageForm: 'cream',
    strength: '1% w/w',
    manufacturer: 'DermaCare Ltd',
    currentStock: 60,
    reorderLevel: 20,
    expiryDate: new Date('2026-01-10'),
    batchNumber: 'ASC2024006',
    unitPrice: 45.00,
    location: 'Shelf E1',
    prescriptionRequired: false
  }
];

// Create medications
const seedMedications = async () => {
  try {
    // Clear existing medications
    await Medication.deleteMany({});
    console.log('Existing medications cleared');

    // Create new medications
    const createdMedications = await Medication.create(medications);
    console.log(`${createdMedications.length} medications created`);
    
    // Log created medications
    createdMedications.forEach(med => {
      console.log(`Created: ${med.name} (${med.genericName}) - Stock: ${med.currentStock}, Expires: ${med.expiryDate.toDateString()}`);
    });

    console.log('Medication seeding completed!');
    process.exit();
  } catch (error) {
    console.error('Error seeding medications:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedMedications();
