// backend/seeder/seedRooms.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../src/models/roomModel.js';

dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Delete existing rooms
  await Room.deleteMany({});
  console.log('🗑️ Existing rooms deleted');

  const rooms = [];
  const blocks = ['A', 'B', 'C'];
  const acTypes = ['AC', 'Non-AC'];
  const sharingTypes = [1, 2, 3, 4, 5];

  let roomCounter = 1;

  for (let block of blocks) {
    for (let floor = 1; floor <= 5; floor++) {
      for (let acType of acTypes) {
        for (let totalBeds of sharingTypes) {
          if (roomCounter > 50) break;

          rooms.push({
            block,
            floor,
            roomNo: `${block}${floor}${roomCounter.toString().padStart(2, '0')}`,
            totalBeds,
            capacity: totalBeds, // Add capacity field
            acType,
          });

          roomCounter++;
        }
        if (roomCounter > 50) break;
      }
      if (roomCounter > 50) break;
    }
    if (roomCounter > 50) break;
  }

  await Room.insertMany(rooms);
  console.log(`✅ Inserted ${rooms.length} rooms`);

  process.exit();
} catch (error) {
  console.error('❌ Seeder Error:', error);
  process.exit(1);
}
