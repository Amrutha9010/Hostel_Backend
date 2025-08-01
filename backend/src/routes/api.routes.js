import express from 'express';
import authRouter from './auth.routes.js';
import studentRouter from './student.routes.js';
import wardenRouter from './warden.routes.js';
import leaveRoutes from './leave.routes.js';
import roomChangeRoutes from './roomChange.routes.js';
import complaintRoutes from './complaint.routes.js';
import roomAssignmentRoutes from './roomAssignment.routes.js';


// import roomApplicationRoutes from './roomApplication.routes.js';


const router = express.Router();

router.use('/api/v1/auth', authRouter);
router.use('/api/v1/students', studentRouter);
router.use('/api/v1/wardens', wardenRouter);
router.use('/api/v1/leave', leaveRoutes);
router.use('/api/v1', roomChangeRoutes);
router.use('/api/v1/complaints', complaintRoutes); 
router.use('/api/v1/room-assignment', roomAssignmentRoutes);

// router.use('/api/v1/room-application', roomApplicationRoutes);

export default router;
