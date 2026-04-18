import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (form.password.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        studentId: form.studentId || undefined,
        password: form.password
      });
      toast.success('สมัครสมาชิกสำเร็จ!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-2xl">สอบ</span>
          </div>
          <h1 className="text-3xl font-bold text-white">สมัครสมาชิก</h1>
          <p className="text-gray-400 mt-2">สร้างบัญชีเพื่อจองที่นั่งสอบ</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">ชื่อ-นามสกุล *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="ชื่อ นามสกุล"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">อีเมล *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">รหัสนักศึกษา (ถ้ามี)</label>
              <input
                type="text"
                value={form.studentId}
                onChange={e => setForm({...form, studentId: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="65XXXXXXX"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">รหัสผ่าน *</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">ยืนยันรหัสผ่าน *</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                           text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 
                         text-black font-bold py-3 rounded-xl transition-colors mt-2
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  กำลังสมัคร...
                </>
              ) : 'สมัครสมาชิก'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            มีบัญชีแล้ว?{' '}
            <Link to="/login" className="text-yellow-500 hover:text-yellow-400 font-medium">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
