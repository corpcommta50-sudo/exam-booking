const express = require('express');
const Exam = require('../models/Exam');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all exams
router.get('/', protect, async (req, res) => {
  try {
    const exams = await Exam.find({ status: { $ne: 'cancelled' } })
      .sort({ date: 1 });
    
    res.json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get exam with seats
router.get('/:id/seats', protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบข้อมูลการสอบ' 
      });
    }

    // Get all confirmed bookings for this exam
    const bookings = await Booking.find({ 
      exam: req.params.id, 
      status: 'confirmed' 
    }).populate('user', 'name studentId');

    // Build seat map
    const bookedSeats = {};
    bookings.forEach(booking => {
      bookedSeats[booking.seatNumber] = {
        bookingId: booking._id,
        userId: booking.user._id,
        userName: booking.user.name,
        studentId: booking.user.studentId,
        bookingCode: booking.bookingCode
      };
    });

    // Check if current user already booked
    const userBooking = bookings.find(
      b => b.user._id.toString() === req.user._id.toString()
    );

    res.json({ 
      success: true, 
      exam, 
      bookedSeats,
      userBooking: userBooking || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create exam (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { rows, seatsPerRow, ...rest } = req.body;
    const totalSeats = rows * seatsPerRow;
    
    const exam = await Exam.create({
      ...rest,
      rows,
      seatsPerRow,
      totalSeats,
      availableSeats: totalSeats
    });

    res.status(201).json({ 
      success: true, 
      message: 'สร้างการสอบสำเร็จ', 
      exam 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Seed demo exams (for testing)
router.post('/seed', protect, adminOnly, async (req, res) => {
  try {
    await Exam.deleteMany({});
    
    const exams = await Exam.create([
      {
        title: 'สอบกลางภาค วิชาคณิตศาสตร์',
        subject: 'MATH101',
        date: new Date('2024-12-20'),
        startTime: '09:00',
        endTime: '12:00',
        room: 'ห้อง 301',
        building: 'อาคาร A',
        rows: 6,
        seatsPerRow: 10,
        totalSeats: 60,
        availableSeats: 60,
        description: 'สอบกลางภาคประจำภาคเรียนที่ 1'
      },
      {
        title: 'สอบกลางภาค วิชาฟิสิกส์',
        subject: 'PHYS101',
        date: new Date('2024-12-21'),
        startTime: '13:00',
        endTime: '16:00',
        room: 'ห้อง 201',
        building: 'อาคาร B',
        rows: 5,
        seatsPerRow: 8,
        totalSeats: 40,
        availableSeats: 40,
        description: 'สอบกลางภาคประจำภาคเรียนที่ 1'
      }
    ]);

    res.json({ success: true, message: 'Seed สำเร็จ', exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
