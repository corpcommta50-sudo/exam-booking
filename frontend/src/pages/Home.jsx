import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Home() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data.exams);
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    try {
      await api.post('/exams/seed');
      toast.success('เพิ่มข้อมูลทดสอบสำเร็จ');
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'ไม่สามารถเพิ่มข้อมูลได้');
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

  const getAvailabilityColor = (available, total) => {
    const ratio = available / total;
    if (ratio > 0.5) return 'text-green-400';
    if (ratio > 0.2) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">การสอบที่เปิดรับ</h1>
            <p className="text-gray-400 mt-1">สวัสดี, {user?.name} 👋</p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={seedData}
              className="bg-gray-800 hover:bg-gray-700 text-yellow-500 border border-yellow-500/30
                         px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              + เพิ่มข้อมูลทดสอบ
            </button>
          )}
        </div>

        {/* Exam Cards */}
        {exams.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">ยังไม่มีการสอบ</h3>
            <p className="text-gray-600">ยังไม่มีการสอบที่เปิดรับสมัครในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(exam => (
              <Link
                key={exam._id}
                to={`/exam/${exam._id}`}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 
                           hover:border-yellow-500/50 hover:bg-gray-800/50 
                           transition-all duration-200 group"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    exam.status === 'open' 
                      ? 'bg-green-900/50 text-green-400 border border-green-800' 
                      : 'bg-red-900/50 text-red-400 border border-red-800'
                  }`}>
                    {exam.status === 'open' ? '● เปิดรับจอง' : '● ปิดรับจอง'}
                  </span>
                  <span className="text-gray-500 text-xs">{exam.subject}</span>
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-lg mb-3 group-hover:text-yellow-400 transition-colors">
                  {exam.title}
                </h3>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span>📅</span>
                    <span>{formatDate(exam.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span>⏰</span>
                    <span>{exam.startTime} - {exam.endTime} น.</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span>📍</span>
                    <span>{exam.room}, {exam.building}</span>
                  </div>
                </div>

                {/* Availability */}
                <div className="border-t border-gray-800 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 text-sm">ที่นั่งว่าง</span>
                    <span className={`font-bold text-sm ${getAvailabilityColor(exam.availableSeats, exam.totalSeats)}`}>
                      {exam.availableSeats} / {exam.totalSeats}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        exam.availableSeats / exam.totalSeats > 0.5 
                          ? 'bg-green-500' 
                          : exam.availableSeats / exam.totalSeats > 0.2 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${((exam.totalSeats - exam.availableSeats) / exam.totalSeats) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-gray-600 text-xs mt-1">
                    จองแล้ว {exam.totalSeats - exam.availableSeats} ที่นั่ง
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-4 text-center">
                  <span className="text-yellow-500 text-sm font-medium group-hover:text-yellow-400">
                    เลือกที่นั่ง →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
