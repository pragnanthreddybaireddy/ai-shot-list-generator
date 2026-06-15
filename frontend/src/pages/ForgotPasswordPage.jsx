import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetToken(null);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.success && res.token) {
        setResetToken(res.token);
        toast.success('Reset link generated!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 glass-card rounded-2xl relative overflow-hidden group">
      <div className="absolute -inset-1 bg-gradient-to-r from-studio-purple to-studio-neon rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative">
        <h2 className="font-display text-3xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">RECOVERY</h2>
        <p className="text-sm text-studio-muted mb-8">Reset your studio password</p>
        
        {resetToken ? (
          <div className="bg-black/60 border border-studio-neon/50 p-6 rounded-xl text-center space-y-4">
            <div className="w-16 h-16 bg-studio-neon/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-studio-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-studio-neon font-display tracking-widest text-xl">CHECK YOUR INBOX</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              We have sent a secure password reset link to <span className="text-white font-bold">{email}</span>. Please check your email and click the link to continue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-xl text-sm transition-all font-body bg-black/40 border border-white/10 text-white placeholder-studio-muted focus:border-studio-neon focus:ring-1 focus:ring-studio-neon outline-none backdrop-blur-sm"
                placeholder="director@digiquest.studio"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-display text-lg tracking-widest transition-all bg-studio-neon text-black hover:bg-studio-purple hover:text-white font-bold disabled:opacity-50"
            >
              {loading ? 'GENERATING...' : 'GET RESET LINK'}
            </button>
          </form>
        )}
        
        <p className="mt-6 text-center text-sm text-studio-muted">
          Remember your password? <Link to="/login" className="text-white hover:text-studio-neon transition-colors">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
