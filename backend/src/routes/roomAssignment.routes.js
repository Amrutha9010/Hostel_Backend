import express from 'express';
import RoomApplication from '../models/roomApplicationModel.js';
import Student from '../models/Student.model.js';
import Room from '../models/roomModel.js';

const router = express.Router();

// POST /api/room-assignment/assign
router.post('/assign', async (req, res) => {
  const { applicationId, roomNo, block, floor, bedNo } = req.body;

  try {
    const application = await RoomApplication.findById(applicationId);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const student = new Student({
      fullName: application.fullName,
      rollNumber: application.rollNumber,
      gender: application.gender,
      phone: application.phone,
      parentPhone: application.parentPhone,
      address: application.address,
      medicalInfo: application.medicalInfo,
      acType: application.acType,
      sharingType: application.sharingType,
      studentPhoto: application.studentPhoto,
      aadhaar: application.aadhaar,
      collegeId: application.collegeId,
      roomNo,
      block,
      floor,
      bedNo,
      joinDate: new Date(),
    });
    await student.save();

    const room = await Room.findOne({ roomNo });
    const bedIndex = room.beds.findIndex(bed => bed.bedNo === bedNo);
    room.beds[bedIndex].occupied = true;
    await room.save();

    await RoomApplication.findByIdAndDelete(applicationId);

    res.status(200).json({ message: 'Room assigned and student created' });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
