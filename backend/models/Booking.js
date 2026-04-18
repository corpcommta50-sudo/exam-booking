const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  seatNumber: {
    type: String,
    required: true
  },
  row: {
    type: String,
    required: true
  },
  column: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  bookingCode: {
    type: String,
    unique: true
  }
}, { timestamps: true });

// Prevent duplicate seat booking - compound unique index
bookingSchema.index(
  { exam: 1, seatNumber: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'confirmed' }
  }
);

// Prevent user from booking multiple seats in same exam
bookingSchema.index(
  { exam: 1, user: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'confirmed' }
  }
);

// Generate booking code
bookingSchema.pre('save', function(next) {
  if (!this.bookingCode) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingCode = `BK-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
