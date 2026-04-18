const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Exam = require('../models/Exam');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Book a seat
router.post('/', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { examId, seatNumber, row, column } = req.body;

    // Check exam exists and open
    const exam = await Exam.findById(examId).session(session);
    if (!exam) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบข้อมูลการสอบ' 
      });
    }

    if (exam.status !== 'open') {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: 'การสอบนี้ปิดรับการจองแล้ว' 
      });
    }

    if (exam.availableSeats <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: 'ที่นั่งเต็มแล้ว' 
      });
    }

    // Check if user already booked this exam
    const existingUserBooking = await Booking.findOne({
      exam: examId,
      user: req.user._id,
      status: 'confirmed'
    }).session(session);

    if (existingUserBooking) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: `คุณได้จองที่นั่ง ${existingUserBooking.seatNumber} ในการสอบนี้แล้ว` 
      });
    }

    // Check if seat already taken
    const existingSeatBooking = await Booking.findOne({
      exam: examId,
      seatNumber,
      status: 'confirmed'
    }).session(session);

    if (existingSeatBooking) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: `ที่นั่ง ${seatNumber} ถูกจองแล้ว กรุณาเลือกที่นั่งอื่น` 
      });
    }

    // Create booking
    const booking = await Booking.create([{
      user: req.user._id,
      exam: examId,
      seatNumber,
      row,
      column
    }], { session });

    // Update available seats
    await Exam.findByIdAndUpdate(
      examId,
      { $inc: { availableSeats: -1 } },
      { session }
    );

    await session.commitTransaction();

    // Populate booking data
    const populatedBooking = await Booking.findById(booking[0]._id)
      .populate('exam', 'title subject date startTime endTime room building')
      .populate('user', 'name email studentId');

    res.status(201).json({
      success: true,
      message: `จองที่นั่ง ${seatNumber} สำเร็จ!`,
      booking: populatedBooking
    });

  } catch (error) {
    await session.abortTransaction();
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'ที่นั่งนี้ถูกจองแล้ว กรุณาเลือกที่นั่งอื่น' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    session.endSession();
  }
});

// Get user's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      user: req.user._id 
    })
    .populate('exam', 'title subject date startTime endTime room building status')
    .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel booking
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'confirmed'
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบการจอง' 
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Restore available seat
    await Exam.findByIdAndUpdate(
      booking.exam,
      { $inc: { availableSeats: 1 } }
    );

    res.json({ 
      success: true, 
      message: 'ยกเลิกการจองสำเร็จ' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
