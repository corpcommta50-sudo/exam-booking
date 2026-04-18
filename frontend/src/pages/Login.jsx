import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('เข้าสู่ระบบสำเร็จ!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-2xl">สอบ</span>
          </div>
          <h1 className="text-3xl font-bold text-white">ExamSeat</h1>
          <p className="text-gray-400 mt-2">ระบบจองที่นั่งสอบ</p>
        </div>

        {/* Form */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">เข้าสู่ระบบ</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-sm mb-2">อีเมล</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500
                           transition-colors"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">รหัสผ่าน</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500
                           transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 
                         text-black font-bold py-3 rounded-xl transition-colors
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="text-yellow-500 hover:text-yellow-400 font-medium">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
