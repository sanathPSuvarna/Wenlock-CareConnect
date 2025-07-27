const mongoose = require('mongoose');
const Medication = require('./models/medicationModel');

async function testPharmacyData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/wenlock-hospital');
    console.log('Connected to MongoDB');

    // Test getting medications
    const medications = await Medication.find();
    console.log(`\nTotal medications in database: ${medications.length}`);

    if (medications.length > 0) {
      console.log('\nFirst medication:', {
        name: medications[0].name,
        currentStock: medications[0].currentStock,
        reorderLevel: medications[0].reorderLevel,
        unitPrice: medications[0].unitPrice,
        expiryDate: medications[0].expiryDate
      });
    }

    // Test inventory summary calculations
    const totalCount = await Medication.countDocuments();
    console.log(`\nTotal count: ${totalCount}`);

    // Low stock items
    const lowStockItems = await Medication.find({
      $expr: { $lte: ['$currentStock', '$reorderLevel'] }
    });
    console.log(`Low stock items: ${lowStockItems.length}`);
    if (lowStockItems.length > 0) {
      console.log('Low stock medications:', lowStockItems.map(m => `${m.name} (${m.currentStock}/${m.reorderLevel})`));
    }

    // Expired medications
    const today = new Date();
    const expiredItems = await Medication.find({
      expiryDate: { $lt: today }
    });
    console.log(`Expired items: ${expiredItems.length}`);
    if (expiredItems.length > 0) {
      console.log('Expired medications:', expiredItems.map(m => `${m.name} (expires: ${m.expiryDate})`));
    }

    // Calculate total value
    const stockValueData = await Medication.aggregate([
      {
        $project: {
          totalValue: { $multiply: ['$currentStock', '$unitPrice'] }
        }
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$totalValue' }
        }
      }
    ]);

    const totalValue = stockValueData.length > 0 ? stockValueData[0].totalValue : 0;
    console.log(`Total inventory value: ₹${totalValue.toFixed(2)}`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Test failed:', error);
    mongoose.disconnect();
  }
}

testPharmacyData();
