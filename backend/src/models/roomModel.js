// backend/src/models/Room.model.js

import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  block: { type: String, required: true },
  floor: { type: String, required: true },
  roomNo: { type: String, required: true, unique: true },
  acType: { type: String, enum: ['AC', 'Non-AC'], required: true },
  sharingType: { type: String, enum: ['1', '2', '3', '4', '5'], required: true },
  capacity: { type: Number, required: true },
  occupants: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      joinDate: { type: Date },
    },
  ],
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
