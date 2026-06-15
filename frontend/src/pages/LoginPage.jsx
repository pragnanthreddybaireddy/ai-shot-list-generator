import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!', { icon: '👋' });
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 glass-card rounded-2xl relative overflow-hidden group">
      <div className="absolute -inset-1 bg-gradient-to-r from-studio-purple to-studio-neon rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative">
        <h2 className="font-display text-3xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">LOGIN</h2>
        <p className="text-sm text-studio-muted mb-8">Access your private studio workspace</p>
        
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-xl text-sm transition-all font-body bg-black/40 border border-white/10 text-white placeholder-studio-muted focus:border-studio-neon focus:ring-1 focus:ring-studio-neon outline-none backdrop-blur-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex justify-end mt-[-10px]">
            <Link to="/forgot-password" className="text-xs text-studio-muted hover:text-white transition-colors">
              Forgot Password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-display text-lg tracking-widest transition-all bg-studio-neon text-black hover:bg-studio-purple hover:text-white font-bold disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'ENTER STUDIO'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-studio-muted">
          Don't have an account? <Link to="/register" className="text-studio-neon hover:text-white transition-colors">Register</Link>
        </p>
      </div>
    </div>
  );
}
