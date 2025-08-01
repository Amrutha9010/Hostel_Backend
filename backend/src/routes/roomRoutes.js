import express from 'express';
import Room from '../models/roomModel.js';
const router = express.Router();

// Get all rooms
router.get('/', async (req, res) => {
  const rooms = await Room.find();
  res.json({ success: true, data: rooms });
});

// Assign student to a room
router.put('/assign/:roomNo', async (req, res) => {
  const { studentId, bedNo } = req.body;
  const { roomNo } = req.params;

  try {
    const room = await Room.findOne({ roomNo });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    if (room.occupants.length >= room.capacity)
      return res.status(400).json({ success: false, message: 'Room is full' });

    room.occupants.push({ studentId, bedNo });
    await room.save();

    res.json({ success: true, message: 'Student assigned to room' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
