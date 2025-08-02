import express from 'express';
import RoomApplication from '../models/roomApplicationModel.js';
import Student from '../models/Student.model.js';
import Room from '../models/roomModel.js';

const router = express.Router();

// Get suitable rooms for an application
router.get('/suitable-rooms/:applicationId', async (req, res) => {
  try {
    const application = await RoomApplication.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const studentSharing = parseInt(application.sharingType); // example: "4"
      const suitableRooms = await Room.find({
        acType: application.acType,
        capacity: studentSharing,
        $expr: {
          $lt: [{ $size: "$occupants" }, "$capacity"]
        }
      });


    res.status(200).json({
      success: true,
      data: suitableRooms.map(room => ({
          roomNo: room.roomNo,
          block: room.block,
          floor: room.floor,
          capacity: room.capacity,
          availableBeds: room.capacity - room.occupants.length,
          acType: room.acType,
          sharingType: room.sharingType
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Manual room assignment and student creation
router.post('/assign', async (req, res) => {
  const { applicationId, roomNo, block, floor, bedNo } = req.body;

  try {
    const application = await RoomApplication.findById(applicationId);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const room = await Room.findOne({ roomNo, block, floor });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const bedIndex = room.beds.findIndex(bed => bed.bedNo === bedNo);
    if (bedIndex === -1) return res.status(400).json({ error: 'Bed not found in room' });
    if (room.beds[bedIndex].occupied) return res.status(400).json({ error: 'Bed already occupied' });

    const newStudent = new Student({
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

    const savedStudent = await newStudent.save();

    // Update room occupancy
    room.beds[bedIndex].occupied = true;
    room.occupants.push(savedStudent._id);
    await room.save();

    // Delete application
    await RoomApplication.findByIdAndDelete(applicationId);

    res.status(200).json({ message: 'Room assigned and student created successfully' });
  } catch (err) {
    console.error('Assignment error:', err);
    res.status(500).json({ error: 'Something went wrong during assignment' });
  }
});

export default router;
