import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings);
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('ต้องการยกเลิกการจองนี้?')) return;
    
    setCancelling(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success('ยกเลิกการจองสำเร็จ');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'ยกเลิกไม่สำเร็จ');
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">การจองของฉัน</h1>
        <p className="text-gray-400 mb-8">ประวัติการจองที่นั่งสอบทั้งหมด</p>

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">ยังไม่มีการจอง</h3>
            <p className="text-gray-600">ไปจองที่นั่งสอบได้เลย!</p>
          </div>
        ) : (
          <>
            {/* Active Bookings */}
            {confirmedBookings.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  การจองที่ใช้งานอยู่ ({confirmedBookings.length})
                </h2>
                <div className="space-y-4">
                  {confirmedBookings.map(booking => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      onCancel={handleCancel}
                      cancelling={cancelling === booking._id}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled Bookings */}
            {cancelledBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-500 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  ยกเลิกแล้ว ({cancelledBookings.length})
                </h2>
                <div className="space-y-4 opacity-60">
                  {cancelledBookings.map(booking => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      cancelled
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancel, cancelling, cancelled, formatDate }) {
  const exam = booking.exam;
  
  return (
    <div className={`bg-gray-900 border rounded-2xl p-6 ${
      cancelled ? 'border-gray-800' : 'border-gray-700'
    }`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          {/* Booking Code */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 
                             text-xs font-mono font-bold px-3 py-1 rounded-full">
              {booking.bookingCode}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              cancelled 
                ? 'bg-red-900/30 text-red-400' 
                : 'bg-green-900/30 text-green-400'
            }`}>
              {cancelled ? 'ยกเลิกแล้ว' : 'ยืนยันแล้ว'}
            </span>
          </div>

          {/* Exam Title */}
          <h3 className="text-white font-bold text-lg mb-1">{exam?.title}</h3>
          <p className="text-gray-500 text-sm mb-3">{exam?.subject}</p>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-yellow-400 text-xl font-bold">{booking.seatNumber}</p>
              <p className="text-gray-500 text-xs">ที่นั่ง</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-white text-sm font-medium">{exam?.room}</p>
              <p className="text-gray-500 text-xs">ห้อง</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-white text-sm font-medium">{formatDate(exam?.date)}</p>
              <p className="text-gray-500 text-xs">วันที่</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-white text-sm font-medium">{exam?.startTime} - {exam?.endTime}</p>
              <p className="text-gray-500 text-xs">เวลา</p>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        {!cancelled && onCancel && (
          <button
            onClick={() => onCancel(booking._id)}
            disabled={cancelling}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 
                       border border-red-800 hover:border-red-600
                       px-4 py-2 rounded-xl text-sm transition-all
                       flex items-center gap-2 disabled:opacity-50"
          >
            {cancelling ? (
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
            ) : '✕'}
            {cancelling ? 'กำลังยกเลิก...' : 'ยกเลิกการจอง'}
          </button>
        )}
      </div>

      {/* Booked at */}
      <p className="text-gray-600 text-xs mt-3">
        จองเมื่อ: {new Date(booking.createdAt).toLocaleString('th-TH')}
      </p>
    </div>
  );
}
