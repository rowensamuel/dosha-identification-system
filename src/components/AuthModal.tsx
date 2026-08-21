import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, User, Calendar, Smile, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, user: { id: number; name: string; email: string; age: number; gender: string; isAdmin: boolean }) => void;
}

type AuthTab = 'login' | 'register' | 'forgot';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      onAuthSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, age, gender }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      onAuthSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');

      setMessage(data.message);
      setTab('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md overflow-hidden bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-0">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
              {tab === 'login' && 'Welcome Back'}
              {tab === 'register' && 'Create Your Profile'}
              {tab === 'forgot' && 'Reset Secure Password'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tab === 'login' && 'Unlock personalized Ayurvedic healthcare insights'}
              {tab === 'register' && 'Begin your journey to dynamic Tridoshic balance'}
              {tab === 'forgot' && 'Configure a new password for your account'}
            </p>
          </div>

          {/* Tab Navigation */}
          {tab !== 'forgot' && (
            <div className="flex border-b border-gray-100 dark:border-gray-800 mt-6">
              <button
                onClick={() => { setTab('login'); setError(''); setMessage(''); }}
                className={`cursor-pointer flex-1 py-3 text-sm font-semibold font-display border-b-2 transition-all ${
                  tab === 'login'
                    ? 'border-ayur-green-500 text-ayur-green-600 dark:text-ayur-green-400'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setTab('register'); setError(''); setMessage(''); }}
                className={`cursor-pointer flex-1 py-3 text-sm font-semibold font-display border-b-2 transition-all ${
                  tab === 'register'
                    ? 'border-ayur-green-500 text-ayur-green-600 dark:text-ayur-green-400'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Modal Body / Forms */}
        <div className="p-6">
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-medium border border-red-100/50 dark:border-red-900/30">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-100/50 dark:border-emerald-900/30">
              {message}
            </div>
          )}

          <AnimatePresence mode="wait">
            {tab === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-display">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. name@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-ayur-green-500 dark:bg-gray-850 dark:text-white outline-hidden text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-display">Password</label>
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="cursor-pointer text-xs font-semibold text-ayur-gold-500 hover:text-ayur-gold-600"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-ayur-green-500 dark:bg-gray-850 dark:text-white outline-hidden text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer w-full py-3.5 rounded-xl bg-ayur-green-500 hover:bg-ayur-green-600 disabled:bg-gray-300 text-white font-semibold font-display shadow-lg hover:shadow-xl hover:shadow-ayur-green-500/15 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Sign In To System'}
                </button>

                <div className="text-center mt-2">
                  <p className="text-xs text-gray-500">
                    Demo Admin: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">admin@ayurveda.org</span> / <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">admin123</span>
                  </p>
                </div>
              </motion.form>
            )}

            {tab === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-display">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Samuel Rowen"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-ayur-green-500 dark:bg-gray-850 dark:text-white outline-hidden text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-display">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. sam@gmail.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-ayur-green-500 dark:bg-gray-850 dark:text-white outline-hidden text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-display">Age</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                        min="1"
                        max="120"
                        placeholder="Age"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-ayur-green-500 dark:bg-gray-850 dark:text-white outline-hidden text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-display">Gender</label>
                    <div className="relative">
                      <Smile className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-ayur-green-500 dark:bg-gray-850 dark:text-white outline-hidden text-sm appearance-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-display">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-ayur-green-500 dark:bg-gray-850 dark:text-white outline-hidden text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer w-full py-3.5 rounded-xl bg-ayur-green-500 hover:bg-ayur-green-600 disabled:bg-gray-300 text-white font-semibold font-display shadow-lg hover:shadow-xl hover:shadow-ayur-green-500/15 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Register Account'}
                </button>
              </motion.form>
            )}

            {tab === 'forgot' && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleForgotPassword}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-display">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter registered email"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-ayur-green-500 dark:bg-gray-850 dark:text-white outline-hidden text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-display">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new strong password"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-ayur-green-500 dark:bg-gray-850 dark:text-white outline-hidden text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="cursor-pointer flex-1 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold font-display text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer flex-1 py-3.5 rounded-xl bg-ayur-green-500 hover:bg-ayur-green-600 disabled:bg-gray-300 text-white font-semibold font-display shadow-lg hover:shadow-xl hover:shadow-ayur-green-500/15 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm Reset'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
