import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    const e = params.get('email');
    if (t) setToken(t);
    if (e) setEmail(e);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) {
      toast.error('Invalid or missing reset token');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, token, newPassword });
      setSuccess(true);
      toast.success('Password reset successfully! You can now log in.');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. The link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 glass-card rounded-2xl text-center space-y-6">
        <h2 className="font-display text-3xl tracking-widest text-studio-neon">SUCCESS</h2>
        <p className="text-gray-300">Your password has been successfully updated.</p>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-4 rounded-xl font-display text-lg tracking-widest transition-all bg-white text-black hover:bg-studio-neon font-bold"
        >
          GO TO LOGIN
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 glass-card rounded-2xl relative overflow-hidden group">
      <div className="absolute -inset-1 bg-gradient-to-r from-studio-purple to-studio-neon rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative">
        <h2 className="font-display text-3xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">NEW PASSWORD</h2>
        <p className="text-sm text-studio-muted mb-8">Secure your workspace</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-5 py-4 rounded-xl text-sm font-body bg-black/60 border border-white/5 text-gray-400 outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-xl text-sm transition-all font-body bg-black/40 border border-white/10 text-white placeholder-studio-muted focus:border-studio-neon focus:ring-1 focus:ring-studio-neon outline-none backdrop-blur-sm"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-xl text-sm transition-all font-body bg-black/40 border border-white/10 text-white placeholder-studio-muted focus:border-studio-neon focus:ring-1 focus:ring-studio-neon outline-none backdrop-blur-sm"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-display text-lg tracking-widest transition-all bg-studio-neon text-black hover:bg-studio-purple hover:text-white font-bold disabled:opacity-50"
          >
            {loading ? 'SAVING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-studio-muted">
          <Link to="/login" className="text-white hover:text-studio-neon transition-colors">Cancel</Link>
        </p>
      </div>
    </div>
  );
}
