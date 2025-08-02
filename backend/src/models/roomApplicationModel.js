import mongoose from 'mongoose';

const roomApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  branchYear: { type: String, required: true },
  gender: { type: String, required: true },
  studentPhoto: { type: String }, // URL or base64
  phone: { type: String, required: true },
  parentPhone: { type: String, required: true },
  address: { type: String, required: true },
  aadhaar: { type: String }, // URL or number
  collegeId: { type: String }, // URL
  medicalInfo: { type: String },

  // Preferences
  sharingType: { type: String, enum: ['1', '2', '3', '4', '5'], required: true },
  acType: { type: String, enum: ['AC', 'Non-AC'], required: true },

  // Status Tracking
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  joinDate: { type: Date }, // Filled by warden after approval
  assignedRoom: { type: String }, // Filled by warden
}, { timestamps: true });


const RoomApplication = mongoose.model('RoomApplication', roomApplicationSchema);
export default RoomApplication;
