import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  block: { type: String, required: true },
  floor: { type: String, required: true },
  roomNo: { type: String, required: true, unique: true },
  acType: { type: String, required: true },
  capacity: { type: Number, required: true }, // total beds
  occupants: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      bedNo: String,
    }
  ]
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
