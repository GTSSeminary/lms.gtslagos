import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Spinner from '../components/Spinner';
import { GraduationCap } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const data = await api.post('/api/auth/forgot-password', { email }, { auth: false });
      setMessage(data.message || 'If the email exists, a reset code has been sent.');
    } catch (err) {
      setError(err.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-3">
            <GraduationCap size={28} />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">Forgot password</h1>
          <p className="text-slate-400 text-sm">We'll send a reset code to your email</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          {message && (
            <div className="mb-4 rounded-2xl bg-emerald-50 text-emerald-700 text-sm px-4 py-3">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 transition-colors disabled:opacity-60"
            >
              {loading && <Spinner className="h-4 w-4 border-white border-t-transparent" />}
              Send reset code
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-500">
            <Link to="/login" className="text-indigo-600 hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
