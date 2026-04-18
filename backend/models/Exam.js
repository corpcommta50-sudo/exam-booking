const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  building: {
    type: String,
    required: true
  },
  rows: {
    type: Number,
    required: true,
    default: 6
  },
  seatsPerRow: {
    type: Number,
    required: true,
    default: 10
  },
  totalSeats: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'cancelled'],
    default: 'open'
  },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
