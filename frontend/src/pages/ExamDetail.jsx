import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import toast from 'react-hot-toast';

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [bookedSeats, setBookedSeats] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedSeatInfo, setSelectedSeatInfo] = useState(null);
  const [userBooking, setUserBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const fetchExamData = useCallback(async () => {
    try {
      const res = await api.get(`/exams/${id}/seats`);
      setExam(res.data.exam);
      setBookedSeats(res.data.bookedSeats);
      setUserBooking(res.data.userBooking);
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchExamData();
    // Real-time polling every 10 seconds
    const interval = setInterval(fetchExamData, 10000);
    return () => clearInterval(interval);
  }, [fetchExamData]);

  const handleSelectSeat = (seatNumber, row, column) => {
    if (selectedSeat === seatNumber) {
      setSelectedSeat(null);
      setSelectedSeatInfo(null);
    } else {
      setSelectedSeat(seatNumber);
      setSelectedSeatInfo({ seatNumber, row, column });
    }
  };

  const handleBooking = async () => {
    if (!selectedSeatInfo) return;
    
    setBooking(true);
    try {
      const res = await api.post('/bookings', {
        examId: id,
        seatNumber: selectedSeatInfo.seatNumber,
        row: selectedSeatInfo.row,
        column: selectedSeatInfo.column
      });
      
      toast.success(res.data.message);
      setSelectedSeat(null);
      setSelectedSeatInfo(null);
      await fetchExamData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'จองไม่สำเร็จ');
      await fetchExamData(); // Refresh to get latest state
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">กำลังโหลดแผนที่ที่นั่ง...</p>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  const bookedCount = exam.totalSeats - exam.availableSeats;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          กลับ
        </button>

        {/* Exam Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-500 text-sm font-bold">{exam.subject}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  exam.status === 'open' 
                    ? 'bg-green-900/50 text-green-400' 
                    : 'bg-red-900/50 text-red-400'
                }`}>
                  {exam.status === 'open' ? 'เปิดรับจอง' : 'ปิดรับจอง'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">{exam.title}</h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <span>📅</span>
                  <span className="text-sm">{formatDate(exam.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span>⏰</span>
                  <span className="text-sm">{exam.startTime} - {exam.endTime} น.</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span>📍</span>
                  <span className="text-sm">{exam.room}, {exam.building}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="text-center bg-gray-800 rounded-xl p-4 min-w-[80px]">
                <p className="text-2xl font-bold text-green-400">{exam.availableSeats}</p>
                <p className="text-gray-500 text-xs">ว่าง</p>
              </div>
              <div className="text-center bg-gray-800 rounded-xl p-4 min-w-[80px]">
                <p className="text-2xl font-bold text-red-400">{bookedCount}</p>
                <p className="text-gray-500 text-xs">จองแล้ว</p>
              </div>
              <div className="text-center bg-gray-800 rounded-xl p-4 min-w-[80px]">
                <p className="text-2xl font-bold text-yellow-400">{exam.totalSeats}</p>
                <p className="text-gray-500 text-xs">ทั้งหมด</p>
              </div>
            </div>
          </div>
        </div>

        {/* Already Booked Banner */}
        {userBooking && (
          <div className="bg-green-900/30 border border-green-700 rounded-2xl p-4 mb-6 
                          flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-green-400 font-bold">คุณได้จองที่นั่งแล้ว</p>
              <p className="text-green-300/70 text-sm">
                ที่นั่ง: <span className="font-bold text-green-300">{userBooking.seatNumber}</span>
                {' '} | รหัสการจอง: <span className="font-mono font-bold text-green-300">{userBooking.bookingCode}</span>
              </p>
            </div>
          </div>
        )}

        {/* Seat Map Container */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">แผนที่ที่นั่ง</h2>
            <p className="text-gray-500 text-sm">
              คลิกที่นั่งเพื่อเลือก
            </p>
          </div>

          <SeatMap
            exam={exam}
            bookedSeats={bookedSeats}
            selectedSeat={selectedSeat}
            onSelectSeat={handleSelectSeat}
            userBooking={userBooking}
            currentUserId={user?._id}
          />
        </div>

        {/* Booking Panel - Fixed Bottom */}
        {selectedSeat && !userBooking && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-40">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div>
                <p className="text-gray-400 text-sm">ที่นั่งที่เลือก</p>
                <p className="text-white font-bold text-xl">
                  ที่นั่ง {selectedSeat}
                  <span className="text-gray-400 text-sm font-normal ml-2">
                    แถว {selectedSeatInfo?.row} คอลัมน์ {selectedSeatInfo?.column}
                  </span>
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => { setSelectedSeat(null); setSelectedSeatInfo(null); }}
                  className="px-6 py-3 rounded-xl border border-gray-700 text-gray-400 
                             hover:border-gray-600 hover:text-white transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleBooking}
                  disabled={booking}
                  className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50
                             text-black font-bold rounded-xl transition-colors
                             flex items-center gap-2"
                >
                  {booking ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      กำลังจอง...
                    </>
                  ) : (
                    <>
                      <span>🎫</span>
                      ยืนยันจองที่นั่ง {selectedSeat}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom padding for fixed panel */}
        {selectedSeat && !userBooking && <div className="h-24"></div>}
      </div>
    </div>
  );
}
