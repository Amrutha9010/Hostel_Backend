import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  // Application details
  fullName: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  branchYear: { type: String, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  parentPhone: { type: String, required: true },
  address: { type: String, required: true },
  medicalInfo: { type: String },
  sharingType: { type: String, required: true },
  acType: { type: String, required: true },
  studentPhoto: { type: String },
  aadhaar: { type: String },
  collegeId: { type: String },

  // Room allocation details
  roomNo: { type: String, required: true },
  block: { type: String, required: true },
  floor: { type: String, required: true },
  bedNo: { type: String, required: true },
  joinDate: { type: Date, required: true }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;
