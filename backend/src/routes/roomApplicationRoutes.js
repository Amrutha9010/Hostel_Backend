import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import RoomApplication from '../models/roomApplicationModel.js';
import Student from '../models/Student.model.js'; // Import Student model

const router = express.Router();
const upload = multer({ storage });

// POST /api/room-applications
router.post(
  '/',
  upload.fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'aadhaar', maxCount: 1 },
    { name: 'collegeId', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        fullName,
        rollNumber,
        branchYear,
        gender,
        phone,
        parentPhone,
        address,
        medicalInfo,
        sharingType,
        acType,
      } = req.body;

      const studentPhoto = req.files?.studentPhoto?.[0]?.path || '';
      const aadhaar = req.files?.aadhaar?.[0]?.path || '';
      const collegeId = req.files?.collegeId?.[0]?.path || '';

      const newApplication = new RoomApplication({
        fullName,
        rollNumber,
        branchYear,
        gender,
        phone,
        parentPhone,
        address,
        medicalInfo,
        sharingType,
        acType,
        studentPhoto,
        aadhaar,
        collegeId,
      });

      await newApplication.save();
      res.status(201).json({ success: true, message: 'Application submitted with files!' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/room-applications?status=Pending or Approved
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const applications = await RoomApplication.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/room-applications/:id/approve
router.put('/:id/approve', async (req, res) => {
  try {
    const { assignedRoom, joinDate } = req.body;

    const application = await RoomApplication.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        assignedRoom,
        joinDate: joinDate || new Date(),
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Create Student entry if not exists
    const existingStudent = await Student.findOne({ rollNumber: application.rollNumber });

    if (!existingStudent) {
      const newStudent = new Student({
        fullName: application.fullName,
        rollNumber: application.rollNumber,
        roomNo: application.assignedRoom,
        block: application.assignedRoom.split(' ')[0],
        floor: application.assignedRoom.split(' ')[2],
        bedNo: '1',
        acType: application.acType,
        joinDate: application.joinDate,
        branchYear: application.branchYear,
        gender: application.gender,
        phone: application.phone,
        parentPhone: application.parentPhone,
        address: application.address,
        medicalInfo: application.medicalInfo,
        sharingType: application.sharingType,
        studentPhoto: application.studentPhoto,
        aadhaar: application.aadhaar,
        collegeId: application.collegeId,
      });

      await newStudent.save();
    }

    res.status(200).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
